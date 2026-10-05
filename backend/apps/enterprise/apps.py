from django.apps import AppConfig

class EnterpriseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.enterprise'
    verbose_name = 'SmartCart X Enterprise Architecture'

    def ready(self):
        try:
            from apps.enterprise.events.subscribers import register_default_subscribers
            register_default_subscribers()
        except Exception as e:
            pass
