from django.shortcuts import render
from .models import Car
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.urls import reverse
from django.contrib.auth import authenticate,login,logout
User = get_user_model()
def index(request):
    car = Car.objects.all()
    n = len(car)
    if n <= 3:
        v = n
    else:
        v = n-3
    last_three_cars = car.order_by('id')[v:]
    context = {'cars': last_three_cars}
    cars = {'cars': car, 'context': context}
    return render(request, "carversal/index.html", cars)


def search(request):
    year = request.GET.get('year', '')
    style = request.GET.get('style', '').lower()
    make = request.GET.get('make', '').lower()
    condition = request.GET.get('condition', '').lower()
    model = request.GET.get('model', '').lower()

    filtered_cars = Car.objects.all()

    if year:
        filtered_cars = filtered_cars.filter(year=year)
    if style:
        filtered_cars = filtered_cars.filter(style=style)
    if make:
        filtered_cars = filtered_cars.filter(make=make)
    if condition:
        filtered_cars = filtered_cars.filter(Condition=condition)
    if model:
        filtered_cars = filtered_cars.filter(model=model)

    context = {'cars': filtered_cars}
    print(context)
    return render(request, "carversal/search.html", context)

def signup(request):
    return render(request, 'carversal/signup.html')
def login(request):
    return render(request, 'carversal/login.html')
