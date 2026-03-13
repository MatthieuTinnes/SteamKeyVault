def reverse_proxy(get_response):
    def process_request(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            request.META['REMOTE_ADDR'] = x_forwarded_for.split(',')[0].strip()
        return get_response(request)
    return process_request
