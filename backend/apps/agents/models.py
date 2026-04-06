from django.db import models
from apps.users.models import User

class AgentProducer(models.Model):
    agent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_producers',
                               limit_choices_to={'role': 'agent'})
    producer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managing_agents',
                                  limit_choices_to={'role': 'producer'})
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['agent', 'producer']