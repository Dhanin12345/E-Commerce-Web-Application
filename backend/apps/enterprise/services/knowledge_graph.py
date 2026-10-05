from collections import defaultdict
from apps.products.models import Product
from apps.categories.models import Category
from apps.orders.models import Order, OrderItem
from apps.enterprise.models import Warehouse, WarehouseInventory, KnowledgeDocument
from apps.reviews.models import Review

class CommerceKnowledgeGraphService:
    """
    L23: Enterprise Commerce Knowledge Graph
    Models core commerce entities and relationships:
      CUSTOMER -> PURCHASED -> PRODUCT
      PRODUCT  -> BELONGS_TO -> CATEGORY
      PRODUCT  -> SOLD_BY   -> SELLER
      PRODUCT  -> STORED_AT -> WAREHOUSE
      PRODUCT  -> RELATED_TO -> PRODUCT
      CUSTOMER -> REVIEWED  -> PRODUCT
      ORDER    -> FULFILLED_BY -> WAREHOUSE

    Provides graph traversal for:
      - Multi-hop recommendation candidate discovery
      - Context retrieval for AI RAG ground-truth verification
      - Supply-chain multi-item warehouse consolidation
      - Fraud ring pattern detection
    """

    @classmethod
    def get_graph_snapshot(cls, max_nodes=100):
        """
        Builds and returns the full semantic knowledge graph topology
        for visualization, AI navigation, and graph analytics.
        """
        nodes = []
        links = []
        node_ids = set()

        def add_node(nid, label, entity_type, properties=None):
            if nid not in node_ids:
                node_ids.add(nid)
                nodes.append({
                    'id': str(nid),
                    'label': label,
                    'type': entity_type,
                    'properties': properties or {}
                })

        def add_link(source, target, relationship, weight=1.0):
            links.append({
                'source': str(source),
                'target': str(target),
                'relationship': relationship,
                'weight': weight
            })

        # 1. Product Nodes & Category Relationships
        products = Product.objects.filter(is_active=True).select_related('category')[:30]
        for p in products:
            p_node = f"P_{p.id}"
            add_node(p_node, p.name, 'Product', {'price': float(p.price), 'stock': p.stock})

            # Category relation
            if p.category:
                c_node = f"C_{p.category.id}"
                add_node(c_node, p.category.name, 'Category')
                add_link(p_node, c_node, 'BELONGS_TO')


        # 2. Warehouse Stocking Relationships
        inventories = WarehouseInventory.objects.select_related('warehouse', 'product').all()[:40]
        for inv in inventories:
            p_node = f"P_{inv.product_id}"
            w_node = f"W_{inv.warehouse.code}"
            add_node(w_node, f"{inv.warehouse.name} ({inv.warehouse.code})", 'Warehouse', {
                'city': inv.warehouse.city,
                'capacity': inv.warehouse.capacity_units
            })
            if p_node in node_ids:
                add_link(p_node, w_node, 'STORED_AT', weight=inv.available_quantity)

        # 3. Order & Customer Purchase Relationships
        orders = Order.objects.select_related('user').prefetch_related('items__product').order_by('-created_at')[:25]
        for o in orders:
            o_node = f"O_{o.id}"
            add_node(o_node, f"Order #{o.id}", 'Order', {'total': float(o.total_amount), 'status': o.status})

            if o.user:
                u_node = f"U_{o.user.id}"
                add_node(u_node, o.user.username, 'Customer')
                add_link(u_node, o_node, 'PLACED_ORDER')

            for item in o.items.all():
                p_node = f"P_{item.product_id}"
                if p_node in node_ids:
                    add_link(o_node, p_node, 'CONTAINS_ITEM')
                    if o.user:
                        add_link(f"U_{o.user.id}", p_node, 'PURCHASED')

        # 4. Review Relationships
        reviews = Review.objects.select_related('user', 'product').order_by('-created_at')[:20]
        for r in reviews:
            p_node = f"P_{r.product_id}"
            if p_node in node_ids and r.user:
                u_node = f"U_{r.user.id}"
                add_node(u_node, r.user.username, 'Customer')
                add_link(u_node, p_node, 'REVIEWED', weight=r.rating)

        # 5. Policies & Brand Knowledge
        docs = KnowledgeDocument.objects.all()[:10]
        for doc in docs:
            d_node = f"DOC_{doc.doc_id.hex[:6]}"
            add_node(d_node, doc.title, 'PolicyDoc', {'category': doc.category})

        return {
            "total_nodes": len(nodes),
            "total_links": len(links),
            "nodes": nodes,
            "links": links,
            "entity_breakdown": cls._count_entity_types(nodes),
            "relationship_breakdown": cls._count_relationship_types(links),
        }

    @classmethod
    def query_product_subgraph(cls, product_id):
        """
        Returns the immediate 2-hop semantic neighborhood around a product
        for grounded AI context and visual explanation.
        """
        full_graph = cls.get_graph_snapshot()
        target_node = f"P_{product_id}"

        # 1-hop links
        connected_node_ids = {target_node}
        sub_links = []
        for link in full_graph['links']:
            if link['source'] == target_node or link['target'] == target_node:
                sub_links.append(link)
                connected_node_ids.add(link['source'])
                connected_node_ids.add(link['target'])

        # 2-hop links among connected nodes
        for link in full_graph['links']:
            if link['source'] in connected_node_ids and link['target'] in connected_node_ids:
                if link not in sub_links:
                    sub_links.append(link)

        sub_nodes = [n for n in full_graph['nodes'] if n['id'] in connected_node_ids]

        return {
            "center_node": target_node,
            "subgraph_nodes": sub_nodes,
            "subgraph_links": sub_links,
            "co_purchased_count": sum(1 for l in sub_links if l['relationship'] == 'PURCHASED')
        }

    @classmethod
    def find_copurchased_products(cls, product_id, limit=4):
        """
        Traverses CUSTOMER -> PURCHASED -> PRODUCT edges to find products
        frequently bought together.
        """
        order_ids_with_product = OrderItem.objects.filter(product_id=product_id).values_list('order_id', flat=True)
        copurchased = (
            OrderItem.objects
            .filter(order_id__in=order_ids_with_product)
            .exclude(product_id=product_id)
            .values('product_id', 'product__name', 'product__price')
            .distinct()[:limit]
        )
        return list(copurchased)

    @classmethod
    def _count_entity_types(cls, nodes):
        counts = defaultdict(int)
        for n in nodes:
            counts[n['type']] += 1
        return dict(counts)

    @classmethod
    def _count_relationship_types(cls, links):
        counts = defaultdict(int)
        for l in links:
            counts[l['relationship']] += 1
        return dict(counts)
