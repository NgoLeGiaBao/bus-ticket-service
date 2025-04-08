using RabbitMQ.Client;
using Microsoft.Extensions.Options;
using System.Text;

namespace booking_and_payment_service.rabbitmq.Messaging
{
    public class RabbitMQMessagePublisher : IMessagePublisher
    {
        private readonly IConnection _connection;

        public RabbitMQMessagePublisher(IConnection connection)
        {
            _connection = connection;
        }

        public void Publish(string queueName, string message)
        {
            using var channel = _connection.CreateModel();
            channel.QueueDeclare(queue: queueName, durable: true, exclusive: false, autoDelete: false);

            var body = Encoding.UTF8.GetBytes(message);
            channel.BasicPublish(exchange: "", routingKey: queueName, basicProperties: null, body: body);
        }
    }
}