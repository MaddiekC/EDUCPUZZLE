import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const LOGIN_URL = "/auth/Login";

const Login = () => {
    const userRef = useRef();
    const errRef = useRef();
    const navigate = useNavigate(); // Para redireccionar

    const [user, setUser] = useState("");
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [pwd, setPwd] = useState("");
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        userRef.current.focus();
    }, []);

    useEffect(() => {
        setValidName(USER_REGEX.test(user));
    }, [user]);

    
    useEffect(() => {
        setErrMsg("");
    }, [user, pwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validName || !validPwd) {
            setErrMsg("Invalid Entry");
            return;
        }

        try {
            const response = await axios.post(
                LOGIN_URL,
                JSON.stringify({ username: user, password: pwd }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            
            const accessToken = response?.data?.accessToken; // Verifica si el token está en data
            console.log("Token recibido:", accessToken);

            setUser("");
            setPwd("");
            
            // Redirigir al usuario después de iniciar sesión
            navigate("/dashboard"); 

        } catch (err) {
            if (!err?.response) {
                setErrMsg("No Server Response");
            } else if (err.response.status === 401) {
                setErrMsg("Invalid Username or Password");
            } else if (err.response.status === 500) {
                setErrMsg("Server Error. Try again later.");
            } else {
                setErrMsg("Login Failed");
            }
            errRef.current.focus();
        }
    };

    return (
        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
                {errMsg}
            </p>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">
                    Username:
                    <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
                </label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
                    value={user}
                    required
                    aria-invalid={validName ? "false" : "true"}
                    onFocus={() => setUserFocus(true)}
                    onBlur={() => setUserFocus(false)}
                />
                
                <label htmlFor="password">
                    Password:
                    <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
                </label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                    aria-invalid={validPwd ? "false" : "true"}
                    onFocus={() => setPwdFocus(true)}
                    onBlur={() => setPwdFocus(false)}
                />

                <button disabled={!validName || !validPwd}>Sign In</button>
            </form>
            <p>
                Don't have an account yet?{" "}
                <span className="line">
                    <Link to="/">Register</Link>
                </span>
            </p>
        </section>
    );
};

export default Login;
