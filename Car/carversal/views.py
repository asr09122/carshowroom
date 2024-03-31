from .models import Car
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.urls import reverse
from django.contrib.auth import authenticate,logout
from django.contrib.auth import login as auth_login
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
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        fname = request.POST.get('first_name')
        lname = request.POST.get('last_name')
        password = request.POST.get('password')
        cnfpwd = request.POST.get('confirm_password')

        if password == cnfpwd:
            # Create the user, authenticate, and login
            myuser = User.objects.create_user(username, email, password)
            myuser.first_name = fname
            myuser.last_name = lname
            myuser.save()

            messages.success(request, "Your account has been successfully created")
            return redirect(reverse('carversal:login'))
        else:
            messages.error(request, "Passwords do not match")
            return redirect(reverse('carversal:signup'))

    return render(request, 'carversal/signup.html')
def login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            auth_login(request, user)
            fname1 = User.first_name
            return redirect(reverse('carversal:Car'), fame=fname1)  # Passing fame as a keyword argument

    return render(request, 'carversal/login.html')
