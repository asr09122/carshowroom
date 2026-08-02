import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from carversal.models import Car, CartItem
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from carversal.models import Car, CartItem
from .jwt_auth import generate_jwt_token, jwt_required

@csrf_exempt
def api_login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
    except Exception:
        data = request.POST

    username = data.get('username')
    password = data.get('password')

    user = authenticate(username=username, password=password)
    if not user:
        user_by_email = User.objects.filter(email=username).first()
        if user_by_email:
            user = authenticate(username=user_by_email.username, password=password)
    if user is not None:
        token = generate_jwt_token(user)
        return JsonResponse({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff
            }
        })
    return JsonResponse({'error': 'Invalid credentials'}, status=401)


@csrf_exempt
def api_signup(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
    except Exception:
        data = request.POST

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')

    if not username or not password:
        return JsonResponse({'error': 'Username and password are required'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already exists'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.first_name = first_name
    user.last_name = last_name
    user.save()

    token = generate_jwt_token(user)
    return JsonResponse({
        'message': 'Account created successfully',
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
    }, status=201)




def api_cars_list(request):
    cars = Car.objects.all().order_by('-pub_date')
    
    make_filter = request.GET.get('make')
    style_filter = request.GET.get('style')
    year_filter = request.GET.get('year')
    condition_filter = request.GET.get('condition')
    search_query = request.GET.get('search')

    if make_filter:
        cars = cars.filter(make__iexact=make_filter)
    if style_filter:
        cars = cars.filter(style__iexact=style_filter)
    if year_filter:
        cars = cars.filter(year=year_filter)
    if condition_filter:
        cars = cars.filter(Condition__iexact=condition_filter)
    if search_query:
        cars = cars.filter(model__icontains=search_query) | cars.filter(make__icontains=search_query)

    cars_data = []
    for c in cars:
        cars_data.append({
            'id': c.id,
            'make': c.make,
            'model': c.model,
            'year': c.year,
            'mileage': c.mileage,
            'horsepower': c.horsepower,
            'style': c.style,
            'condition': c.Condition,
            'price': c.price,
            'desc': c.desc,
            'image_url': request.build_absolute_uri(c.image.url) if c.image else None,
            'pre_booking_amount': c.pre_booking_amount(),
            'is_reserved': c.is_reserved,
            'reserved_by': c.reserved_by.username if c.reserved_by else None
        })

    # Available filter options for dynamic frontend dropdowns
    all_cars = Car.objects.all()
    filters = {
        'makes': list(all_cars.values_list('make', flat=True).distinct()),
        'styles': list(all_cars.values_list('style', flat=True).distinct()),
        'years': list(all_cars.values_list('year', flat=True).distinct()),
        'conditions': list(all_cars.values_list('Condition', flat=True).distinct()),
    }

    return JsonResponse({'cars': cars_data, 'filters': filters})


def api_car_detail(request, car_id):
    try:
        c = Car.objects.get(id=car_id)
        return JsonResponse({
            'id': c.id,
            'make': c.make,
            'model': c.model,
            'year': c.year,
            'mileage': c.mileage,
            'horsepower': c.horsepower,
            'style': c.style,
            'condition': c.Condition,
            'price': c.price,
            'desc': c.desc,
            'image_url': request.build_absolute_uri(c.image.url) if c.image else None,
            'pre_booking_amount': c.pre_booking_amount(),
            'is_reserved': c.is_reserved,
            'reserved_by': c.reserved_by.username if c.reserved_by else None
        })
    except Car.DoesNotExist:
        return JsonResponse({'error': 'Car not found'}, status=404)


@csrf_exempt
@jwt_required
def api_cart(request):
    if request.method == 'GET':
        items = CartItem.objects.filter(user=request.user)
        items_data = []
        total_price = 0
        for item in items:
            booking_price = item.car.pre_booking_amount()
            item_total = booking_price * item.quantity
            total_price += item_total
            items_data.append({
                'id': item.id,
                'car_id': item.car.id,
                'make': item.car.make,
                'model': item.car.model,
                'year': item.car.year,
                'price': item.car.price,
                'pre_booking_unit_price': booking_price,
                'quantity': item.quantity,
                'subtotal': item_total,
                'image_url': request.build_absolute_uri(item.car.image.url) if item.car.image else None,
            })
        return JsonResponse({'items': items_data, 'total_prebooking_price': total_price})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            data = request.POST

        car_id = data.get('car_id')
        if not car_id:
            return JsonResponse({'error': 'car_id is required'}, status=400)

        try:
            car = Car.objects.get(id=car_id)
        except Car.DoesNotExist:
            return JsonResponse({'error': 'Car not found'}, status=404)

        if car.is_reserved:
            return JsonResponse({'error': 'This vehicle is already reserved by someone else'}, status=400)

        cart_item, created = CartItem.objects.get_or_create(car=car, user=request.user)
        cart_item.quantity = 1
        cart_item.save()

        return JsonResponse({'message': 'Car added to pre-booking cart successfully', 'quantity': 1})

@csrf_exempt
@jwt_required
def api_checkout(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    items = CartItem.objects.filter(user=request.user)
    if not items.exists():
        return JsonResponse({'error': 'Your reservation cart is empty'}, status=400)

    reserved_cars = []
    total_deposit = 0

    for item in items:
        if not item.car.is_reserved:
            item.car.is_reserved = True
            item.car.reserved_by = request.user
            item.car.save()
            reserved_cars.append(item.car)
            total_deposit += item.car.pre_booking_amount()

    if not reserved_cars:
        return JsonResponse({'error': 'The vehicles in your cart are already reserved by others'}, status=400)

    # Send confirmation email
    if request.user.email:
        print(f"Attempting to send reservation email to: {request.user.email}")
        
        car_list_str = "\n".join([f"- {car.year} {car.make} {car.model}" for car in reserved_cars])
        
        try:
            send_mail(
                subject=f"Reservation Confirmed: Carversal Hyper Motors",
                message=f"Dear {request.user.first_name or request.user.username},\n\nYour reservation for the following vehicle(s) has been confirmed:\n\n{car_list_str}\n\nA total reservation deposit of ${total_deposit:.2f} is noted.\n\nThank you for choosing Carversal Hyper Motors.",
                from_email=getattr(settings, 'EMAIL_HOST_USER', 'asr09122@gmail.com'),
                recipient_list=[request.user.email],
                fail_silently=False,
            )
            print(f"SUCCESS: Email sent to {request.user.email}")
        except Exception as e:
            print("ERROR: Email sending failed:", str(e))
    else:
        print(f"WARNING: No email found for user {request.user.username}. Cannot send reservation email.")

    return JsonResponse({'message': 'Checkout complete, vehicles reserved successfully.'})


@csrf_exempt
@jwt_required
def api_cart_item_delete(request, item_id):
    if request.method != 'DELETE' and request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        item = CartItem.objects.get(id=item_id, user=request.user)
        car = item.car
        
        was_reserved_by_me = (car.reserved_by == request.user)

        # Free the car if I was the one who reserved it
        if was_reserved_by_me:
            car.is_reserved = False
            car.reserved_by = None
            car.save()

        item.delete()

        # Send cancellation email only if it was actually finalized
        if was_reserved_by_me and request.user.email:
            print(f"Attempting to send cancellation email to: {request.user.email}")
            try:
                send_mail(
                    subject=f"Reservation Cancelled: {car.make} {car.model}",
                    message=f"Dear {request.user.first_name or request.user.username},\n\nYour reservation for the {car.year} {car.make} {car.model} has been successfully cancelled.\n\nWe hope to see you again soon at Carversal.",
                    from_email=getattr(settings, 'EMAIL_HOST_USER', 'asr09122@gmail.com'),
                    recipient_list=[request.user.email],
                    fail_silently=False,
                )
                print(f"SUCCESS: Cancellation email sent to {request.user.email}")
            except Exception as e:
                print("ERROR: Email sending failed:", str(e))
        elif not request.user.email:
            print(f"WARNING: No email found for user {request.user.username}. Cannot send cancellation email.")

        return JsonResponse({'message': 'Reservation cancelled successfully', 'quantity': 0})
    except CartItem.DoesNotExist:
        return JsonResponse({'error': 'Cart item not found'}, status=404)


@csrf_exempt
@jwt_required
def api_add_car(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    make = request.POST.get('make')
    model = request.POST.get('model')
    year = request.POST.get('year')
    style = request.POST.get('style')
    condition = request.POST.get('condition')
    mileage = request.POST.get('mileage')
    horsepower = request.POST.get('horsepower')
    price = request.POST.get('price')
    desc = request.POST.get('desc')
    image = request.FILES.get('image')

    if not (make and model and year and price):
        return JsonResponse({'error': 'Missing required fields (make, model, year, price)'}, status=400)

    car = Car.objects.create(
        make=make,
        model=model,
        year=int(year or 0),
        style=style or '',
        Condition=condition or '',
        mileage=int(mileage or 0),
        horsepower=int(horsepower or 0),
        price=float(price or 0),
        desc=desc or '',
        image=image if image else 'default_image.jpg'
    )

    return JsonResponse({'message': 'Car added successfully', 'car_id': car.id}, status=201)
