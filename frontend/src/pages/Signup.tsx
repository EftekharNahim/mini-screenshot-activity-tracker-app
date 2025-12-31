import React, { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { companyAPI } from "../services/api";
import type { CompanySignupData, Plan } from "../types";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] = useState<CompanySignupData>({
    owner_name: "",
    owner_email: "",
    company_name: "",
    password: "",
    plan_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await companyAPI.getPlans();
      console.log("Plans response:", response);
      if (response.data.success && response.data.data) {
        setPlans(response.data.data);
        const firstPlanId = response.data.data?.[0]?.id;
        if (firstPlanId !== undefined) {
          setFormData((prev) => ({ ...prev, plan_id: firstPlanId }));
        }
      }
    } catch (err) {
      console.error("Error loading plans:", err);
    }
  };

  const validateField = (name: string, value: string | number) => {
    switch (name) {
      case "owner_name":
        if (!value) return "Owner name is required";
        if ((value as string).length < 3)
          return "Name must be at least 3 characters";
        return "";

      case "owner_email":
        if (!value) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(value as string))
          return "Invalid email format";
        return "";

      case "company_name":
        if (!value) return "Company name is required";
        if ((value as string).length < 2) return "Company name too short";
        return "";

      case "password":
        if (!value) return "Password is required";
        if ((value as string).length < 6)
          return "Minimum 6 characters required";
        return "";

      case "plan_id":
        if (!value) return "Please select a plan";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === "plan_id" ? parseInt(value) : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    const errorMsg = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await companyAPI.signup(formData);

      if (response.data.success && response.data.data) {
        login(response.data.data.token, "admin", response.data.data.company);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Company Signup
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name
            </label>
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2
                         ${
                           errors.owner_name
                             ? "border-red-500"
                             : "border-gray-300"
                         }`}
            />
            {errors.owner_name && (
              <p className="text-red-500 text-xs mt-1">{errors.owner_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Email
            </label>
            <input
              type="email"
              name="owner_email"
              value={formData.owner_email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2
                         ${
                           errors.owner_email
                             ? "border-red-500"
                             : "border-gray-300"
                         }`}
            />
            {errors.owner_email && (
              <p className="text-red-500 text-xs mt-1">{errors.owner_email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2
                         ${
                           errors.company_name
                             ? "border-red-500"
                             : "border-gray-300"
                         }`}
            />
            {errors.company_name && (
              <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2
                       ${
                         errors.password ? "border-red-500" : "border-gray-300"
                       }`}
              required
              minLength={6}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Plan
            </label>
            <select
              name="plan_id"
              value={formData.plan_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2
                       ${
                         errors.plan_id ? "border-red-500" : "border-gray-300"
                       }`}
            >
              {plans.length === 0 && <option>Loading plans...</option>}
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.pricePerEmployee}/employee
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
