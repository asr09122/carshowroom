from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Car(models.Model):
    Car_id = models.AutoField
    make = models.CharField(max_length=50, default="")
    model = models.CharField(max_length=50)
    mileage = models.IntegerField(default=8)
    horsepower = models.IntegerField(default=180)
    year = models.IntegerField(default=0)
    style = models.CharField(max_length=50, default="")
    Condition = models.CharField(max_length=50, default="")
    price = models.FloatField(default=0)  # FloatField to store decimal values
    desc = models.CharField(max_length=500)
    pub_date = models.DateField(default=timezone.now)
    image = models.ImageField(upload_to="carversal/images", default="default_image.jpg")
    is_reserved = models.BooleanField(default=False)
    reserved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reserved_cars')

    def __str__(self):
        return f"{self.make} {self.model}"

    def pre_booking_amount(self):
        return float(self.price) * 0.10  # Calculate 10% of actual price



class CartItem(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=None)
    date_added = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'`{self.quantity} x {self.car.model}'
