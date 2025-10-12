import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import './Tail.css' // Assuming this file loads your Tailwind directives

function Signup(){
    const [form, setForm] = useState(
        {
            name: "",
            email: "",
            password: "",
            confpassword: ""
        }
    );

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onhandlechange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handlesubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { name, email, password, confpassword } = form;

        // 1. Client-side Validation
        if (password !== confpassword) {
            setError("Passwords do not match. Please try again.");
            setLoading(false);
            return;
        }

        try {
            // 2. Send data to your Express backend
            // Note: We only send name, email, and password (not confpassword)
            const response = await fetch("http://localhost:5000/api/auth/signup", { // 🚨 VERIFY THIS URL AND PORT
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            // Debug: log server response for easier troubleshooting
            console.log('Signup response status:', response.status, 'body:', data);

            if (!response.ok) {
                // The backend sends errors as { message: '...' }
                throw new Error(data.message || data.error || "Signup failed. Please try a different email.");
            }

            // 3. Successful Signup: Save the JWT token (provided by the backend)
            localStorage.setItem("trello_clone_token", data.token);

            // 4. Redirect the user to the dashboard
            navigate("/dashboard");

        } catch (err) {
            // 5. Handle network errors or server-side issues
            console.error("Signup error:", err);
            setError(err.message || "An unexpected error occurred. Check server setup.");
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>
                
                <form onSubmit={handlesubmit} className="space-y-4">

                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={onhandlechange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-black"
                            placeholder="Full Name"
                            disabled={loading}
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={onhandlechange}
                            required
                            className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            placeholder="user@example.com"
                            disabled={loading}
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={onhandlechange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-black"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password:</label>
                        <input
                            type="password"
                            name="confpassword"
                            value={form.confpassword}
                            onChange={onhandlechange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-black"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <p className="text-sm font-medium text-red-600 bg-red-100 p-2 rounded-lg text-center">
                            {error}
                        </p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full text-white rounded-lg py-3 font-semibold transition duration-200 ${
                            loading 
                                ? 'bg-green-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>

                    {/* Link to Login */}
                    <div className="text-center text-sm">
                        <span className="text-gray-600">Already have an account? </span>
                        {/* Assuming your routing has a path for /login */}
                        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;
