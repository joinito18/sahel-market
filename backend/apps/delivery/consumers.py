import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class DeliveryConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs']['order_id']
        self.room_group_name = f'delivery_{self.order_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.update_position(data.get('latitude', 0), data.get('longitude', 0))
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'location_update', 'latitude': data.get('latitude'), 'longitude': data.get('longitude')}
        )

    async def location_update(self, event):
        await self.send(text_data=json.dumps({
            'latitude': event['latitude'],
            'longitude': event['longitude'],
        }))

    @database_sync_to_async
    def update_position(self, lat, lng):
        from .models import DeliveryTracking
        from apps.orders.models import Order
        try:
            order = Order.objects.get(id=self.order_id)
            tracking, _ = DeliveryTracking.objects.get_or_create(order=order)
            tracking.latitude = lat
            tracking.longitude = lng
            tracking.save()
        except Order.DoesNotExist:
            pass
