import { useState } from "react";
import { toast } from "react-hot-toast";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { isEmail , isValidPassword } from "../Helpers/regexMatcher.js"
import HomeLayout from "../Layouts/HomeLayout.jsx"
import { createAccount } from "../Redux/Slices/AuthSlice.js";

function Signup(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [PreviewImage, setPreviewImage] = useState("");
    const [signupData, setSignupData] = useState({
        avatar:"",
        fullname:"",
        password:"",
        email:""
    });

    function handleUserInput (e){
        const {name, value } = e.target
        setSignupData({
            ...signupData,
            [name]: value
        })
    }

    function getImage (event){
        event.preventDefault();
        //Getting the image 
        const uploadedImage = event.target.files[0];

        setSignupData({
            ...signupData,
            avatar: uploadedImage
        });
        const fileReader = new FileReader();
        fileReader.readAsDataURL(uploadedImage);
        fileReader.addEventListener("load",function(){
            setPreviewImage(this.result);
        })
    }

    async function createNewAccount(event){
        event.preventDefault();
        if(!signupData.avatar ||!signupData.password ||!signupData.fullname||!signupData.email){
             toast.error("Please Enter all the details");
             return;
        }
                // checking name field length
                if(signupData.fullname.length < 5) {
                    toast.error("Name should be atleast of 5 characters")
                    return;
                }
                // checking valid email
                if(!isEmail(signupData.email)) {
                    toast.error("Invalid email id");
                    return;
                }
                // checking password validation
                if(!isValidPassword(signupData.password)) {
                    toast.error("Password should be 6 - 16 character long with atleast a number and special character");
                    return;
                }
                
    const formData = new FormData();
    formData.append("fullname", signupData.fullname);
    formData.append("email", signupData.email);
    formData.append("password", signupData.password);
    formData.append("avatar", signupData.avatar);

    // dispatch create account action
    const response = await dispatch(createAccount(formData));
    if(response?.payload?.success)
        navigate("/");

 setSignupData({
        fullName: "",
        email: "",
        password: "",
        avatar: ""
    });
    setPreviewImage("");


                
    }
    return(
        <HomeLayout >
        <div className="flex items-center justify-center h-[90vh]" >
            <form noValidate onSubmit={createNewAccount} className="flex flex-col justify-center gap-3 p-4 rounded-lg text-white w-96 shadow-[0_0_20px_black]">
                <h1 className="text-center text-2xl font-bold">Registration page</h1>
                <label htmlFor="image_uploads" className="cursor-pointer">
                {PreviewImage ? (
                    <img className="w-24 h-24 m-auto rounded-full" src={PreviewImage}/>
                ) : (
                    <BsPersonCircle className="w-24 h-24 m-auto rounded-full"/>
                )
                }
                </label>
                <input 
                onChange={getImage}
                type="file" 
                className="hidden" 
                name="image_uploads"
                id="image_uploads"
                accept=".jpg, .jpeg, .png, .svg"
                 />
                <div className="flex flex-col gap-1">
                <label htmlFor="fullname" className="font-semibold">Name</label>
                <input 
                type="text"
                name="fullname"
                required
                id="fullname"
                placeholder="Please enter your name..."
                className="bg-transparent px-2 py-1 border"
                onChange={handleUserInput}
                value={signupData.fullname}
                 />
                 </div>
                 <div className="flex flex-col gap-1">
                <label htmlFor="email" className="font-semibold">Email</label>
                <input 
                type="email"
                name="email"
                required
                id="email"
                placeholder="Please enter your mail..."
                className="bg-transparent px-2 py-1 border"
                onChange={handleUserInput}
                value={signupData.email}
                 />
                 </div>
                 <div className="flex flex-col gap-1">
                <label htmlFor="password" className="font-semibold">Password</label>
                <input 
                type="password"
                name="password"
                required
                id="password"
                placeholder="Please enter your password..."
                className="bg-transparent px-2 py-1 border"
                onChange={handleUserInput}
                value={signupData.password}
                 />
                 </div>

                 <button type="submit" className="mt-2 bg-yellow-600 hover:bg-yellow-500 transition ease-in-out duration-300 py-2 rounded-sm font-bold text-lg cursor-pointer">
                    Create Account
                 </button>
                <p className="text-center">
                    Already have an account ? <Link to ="/login" className="link text-accent cursor-pointer"> Login </Link>
                </p>
            </form>
        </div>
        </HomeLayout>
    )
}
export default Signup;




























