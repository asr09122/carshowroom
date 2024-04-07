from .models import Car
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.urls import reverse
from django.contrib.auth import authenticate, logout as auth_logout
from django.contrib.auth import login as auth_login
from django.contrib.auth.decorators import login_required
from django.utils import timezone
User = get_user_model()


@login_required
def index(request):
    car = Car.objects.all()
    n = len(car)
    if n <= 3:
        v = n
    else:
        v = n - 3
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


def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            auth_login(request, user)
            fname1 = User.first_name
            return redirect(reverse('carversal:Car'), fame=fname1)  # Passing fame as a keyword argument

    return render(request, 'carversal/login.html')


@login_required
def add_car(request):
    if request.method == 'POST':
        year = request.POST.get('year', '')
        style = request.POST.get('style', '').lower()
        make = request.POST.get('make', '').lower()
        condition = request.POST.get('condition', '').lower()
        model = request.POST.get('model', '').lower()
        mileage = request.POST.get('mileage', '')
        horsepower = request.POST.get('horsepower', '')
        price = request.POST.get('price', '')
        desc = request.POST.get('desc', '')
        image = request.FILES.get('image')  # Get the uploaded image file

        # Validate required fields including image
        if model and make and year and style and condition and mileage and horsepower and price and desc and image:
            # Create a new Car object with pub_date automatically set to today's date
            car = Car.objects.create(
                make=make,
                model=model,
                year=year,
                style=style,
                Condition=condition,
                mileage=mileage,
                horsepower=horsepower,
                price=price,
                desc=desc,
                image=image,  # Assign the image file to the 'image' field
                pub_date=timezone.now()  # Set pub_date to today's date
            )
            # Redirect to a success page or wherever you want
            return redirect(reverse('carversal:add_car'))
        else:
            # If required fields are missing, handle the error (display error message or redirect back to form)
            return render(request, 'carversal/index.html', {'error_message': 'Required fields are missing'})
    else:
        # If request method is not POST, render the form template
        return render(request, 'carversal/upload.html')  # Replace 'add_car_form.html' with your actual template name




def user_logout(request):
    auth_logout(request)
    return redirect(reverse('carversal:Car'))

