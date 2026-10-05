from django.apps import AppConfig


class NextgenConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.nextgen'
    verbose_name = 'SmartCart Next-Gen Extensions'

    def ready(self):
        # Register event handlers upon app readiness
        try:
            import apps.nextgen.events  # noqa
        except ImportError:
            pass
