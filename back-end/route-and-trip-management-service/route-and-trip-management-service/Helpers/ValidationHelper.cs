using System;
using System.Collections.Generic;

namespace route_and_trip_management_service.Helpers
{
    public static class ValidationHelper
    {
        public static Dictionary<string, string> ValidateRequiredFields<T>(T model, params string[] requiredFields)
        {
            var errors = new Dictionary<string, string>();

            if (model == null)
            {
                errors.Add("Model", "Input data cannot be null.");
                return errors;
            }

            var properties = typeof(T).GetProperties();

            foreach (var field in requiredFields)
            {
                var property = Array.Find(properties, p => p.Name.Equals(field, StringComparison.OrdinalIgnoreCase));
                
                if (property == null)
                {
                    errors.Add(field, $"Field '{field}' does not exist in the model.");
                    continue;
                }

                var value = property.GetValue(model);

                if (value == null || (value is string str && string.IsNullOrWhiteSpace(str)))
                {
                    errors.Add(field, $"{field} cannot be empty.");
                }
            }
            return errors;
        }
    }
}
