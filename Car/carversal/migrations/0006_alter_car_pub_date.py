# Generated by Django 5.0.3 on 2024-04-06 20:09

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("carversal", "0005_rename_car_make_car_make_rename_car_name_car_model"),
    ]

    operations = [
        migrations.AlterField(
            model_name="car",
            name="pub_date",
            field=models.DateField(default=django.utils.timezone.now),
        ),
    ]
