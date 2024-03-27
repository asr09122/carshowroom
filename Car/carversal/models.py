from django.db import models

class Car(models.Model):
    Car_id = models.AutoField
    make = models.CharField(max_length=50,default="")
    model = models.CharField(max_length=50)
    mileage = models.IntegerField(default=8)
    horsepower = models.IntegerField(default=180)
    year = models.IntegerField(default=0)
    style = models.CharField(max_length=50, default="")
    Condition = models.CharField(max_length=50, default="")
    price = models.IntegerField(default=0)  # Set a default value for the price field
    desc = models.CharField(max_length=500)
    pub_date = models.DateField()
    image = models.ImageField(upload_to="carversal/images", default="default_image.jpg")


    def __str__(self):
        return self.model