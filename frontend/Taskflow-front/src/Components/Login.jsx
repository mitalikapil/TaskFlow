import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
// Remove or rename the './Tail.css' file if it conflicts with Tailwind
// Ensure your main project index file includes Tailwind imports

function Login(){
    const [form, setForm] = useState(
        {
            email: "",
            password: "",
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

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                // Use error message provided by the backend or a default one
                throw new Error(data.message || "Login failed. Please check credentials.");
            }

            // Successful Login: Save the JWT token and user info
            localStorage.setItem("trello_clone_token", data.token);

            // Redirect the user to the dashboard
            navigate("/dashboard");

        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "An unexpected network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return(
        <div
            // Use flex utility classes to center the content
            className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-10"
        >
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">Welcome Back</h2>
                
                <form onSubmit={handlesubmit} className="space-y-6">

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={onhandlechange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            placeholder="user@example.com"
                            disabled={loading}
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={onhandlechange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <p className="text-sm font-medium text-red-700 bg-red-100 p-3 rounded-lg text-center border border-red-300">
                            {error}
                        </p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full text-white rounded-lg py-3 font-semibold transition duration-200 ${
                            loading 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Logging In...' : 'Login'}
                    </button>

                    {/* Link to Signup */}
                    <div className="text-center text-sm mt-4">
                        <span className="text-gray-600">Don't have an account? </span>
                        <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                            Sign Up
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
