namespace booking_and_payment_service.rabbitmq.Messaging
{
    public interface IMessagePublisher
    {
        void Publish(string queueName, string message);
    }
}