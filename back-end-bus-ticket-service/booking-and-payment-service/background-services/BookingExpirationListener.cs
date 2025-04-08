using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using StackExchange.Redis;
using Microsoft.Extensions.DependencyInjection;

using booking_and_payment_service.services;

namespace booking_and_payment_service.background_services
{
    public class BookingExpirationListener : BackgroundService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public BookingExpirationListener(IConnectionMultiplexer redis, IServiceScopeFactory serviceScopeFactory)
        {
            _redis = redis;
            _serviceScopeFactory = serviceScopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("Booking Expiration Listener started.");
            var subscriber = _redis.GetSubscriber();

            await subscriber.SubscribeAsync("__keyevent@0__:expired", async (channel, key) =>
            {
                if (key.ToString().StartsWith("booking_expire:"))
                {
                    var bookingId = key.ToString().Split(':')[1];

                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        var bookingService = scope.ServiceProvider.GetRequiredService<BookingService>();
                        await bookingService.ExpireBookingAsync(bookingId);
                    }
                }
            });
        }
    }
}
