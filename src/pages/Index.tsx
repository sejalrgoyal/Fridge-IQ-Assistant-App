import { Navigate } from "react-router-dom";

/** Fallback route; main app home is <Dashboard /> at `/`. */
const Index = () => <Navigate to="/" replace />;

export default Index;
