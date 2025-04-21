import * as Yup from "yup";

// schema for Login
export const loginSchema = Yup.object({
  email: Yup.string().email().required("Please enter your email"),
  password: Yup.string().min(6).required("Please enter your password"),
});

// schema for Resgister complete
export const registercompleteSchema = Yup.object({
  name: Yup.string()
    .min(2, "Please provide your complete name")
    .required("Please enter your name"),
  email: Yup.string().email().required("Please enter your email"),
  password: Yup.string().min(6).required("Please enter your password"),
  confim_password: Yup.string()
    .required("Please Confirm Password")
    .oneOf([Yup.ref("password"), null], "Password must match"),
});

// same schema for regitration & forgot passward email
export const registerSchema = Yup.object({
  email: Yup.string().email().required("Please enter your email"),
});

// schema for OTP verification
export const otpSchema = Yup.object({
  otp: Yup.number().required("Please provide OTP"),
});

// same schema for regitration & forgot passward email
export const resetpassSchema = Yup.object({
  password: Yup.string().min(6).required("Please enter your password*"),
  confim_password: Yup.string()
    .required("Please Confirm Password*")
    .oneOf([Yup.ref("password"), null], "Password must match*"),
});

// product Cancel schema
export const productCancelSchema = Yup.object().shape({
  quantity: Yup.number().required("Please provide quantity"),
  reason: Yup.string()
    .oneOf(
      [
        "Wrong Item",
        "Damaged/Faulty",
        "Not as Described",
        "Changed Mind",
        "Other",
      ],
      "Invalid Reason"
    )
    .required("Please select one of these options"),
  comment: Yup.string()
    .min(3, "Please provide long briefing")
    .required("Please enter some briefing"),
  resolution: Yup.string()
    .oneOf(
      ["Refund", "Exchange", "Store Credit", "Repair"],
      "Invalid Resolution"
    )
    .required("Please select one of these options"),
  declaration: Yup.boolean().oneOf(
    [true],
    "Please accept the terms of service"
  ),
});

// product Return schema
export const productReturnSchema = Yup.object().shape({
  quantity: Yup.number().required("Please provide quantity"),
  reason: Yup.string()
    .oneOf(
      [
        "Wrong Item",
        "Damaged/Faulty",
        "Not as Described",
        "Changed Mind",
        "Other",
      ],
      "Invalid Reason"
    )
    .required("Please select one of these options"),
  comment: Yup.string()
    .min(3, "Please provide long briefing")
    .required("Please enter some briefing"),
  condition: Yup.string()
    .oneOf(
      ["Unused", "Unopened", "Opened (but not used)", "Used"],
      "Invalid Condition"
    )
    .required("Please select one of these options"),
  resolution: Yup.string()
    .oneOf(
      ["Refund", "Exchange", "Store Credit", "Repair"],
      "Invalid Resolution"
    )
    .required("Please select one of these options"),
  declaration: Yup.boolean().oneOf(
    [true],
    "Please accept the terms of service"
  ),
});

// optin schema
export const optinSchema = Yup.object({
  email: Yup.string().email().required("Please enter your email"),
});

// ContactUs schema
export const ContactUsSchema = Yup.object({
  fullname: Yup.string()
    .min(2, "Name must be long")
    .required("Please enter your name"),
  subject: Yup.string().min(2).required("Please enter subject"),
  email: Yup.string().email().required("Please enter your email"),
  text: Yup.string().required("Please enter your message"),
});

// User Profile schema
export const UserProfileSchema = Yup.object({
  Name: Yup.string()
    .min(2, "Name must be long")
    .required("Please enter your name"),
  Contact: Yup.string()
    .min(5, "Contact must be valid")
    .required("Please enter contact details"),
  DOB: Yup.string().required("Please enter date of birth"),
  Email: Yup.string().email().required("Please enter your email"),
  Gender: Yup.string()
    .oneOf(["Male", "Female"], "Invalid Gender")
    .required("Please select one of these options"),
});

// User Address book schema
export const UserAddressSchema = Yup.object({
  Address: Yup.string()
    .min(2, "Address must be long")
    .required("Shipping Address Required*"),
  City: Yup.string().min(2, "City must be long").required("City Required*"),
  Province: Yup.string()
    .min(2, "Province must be long")
    .required("Please Enter Province, exp 'Punjab'*"),
});
// User Address+Contact book schema
export const UserAddressAndContactSchema = Yup.object({
  Name: Yup.string()
    .min(2, "Name must be long")
    .required("Please enter your name"),
  Contact: Yup.string()
    .min(5, "Contact must be valid")
    .required("Please enter contact details"),
  Address: Yup.string()
    .min(2, "Address must be long")
    .required("Shipping Address Required*"),
  City: Yup.string().min(2, "City must be long").required("City Required*"),
  Province: Yup.string()
    .min(2, "Province must be long")
    .required("Please Enter Province, exp 'Punjab'*"),
});
