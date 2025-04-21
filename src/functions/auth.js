import axios from "axios";

export const createOrUpdateUser = async (authtoken) => {
  return await axios.post(
    `${process.env.REACT_APP_API}/create-or-update-user`,
    {},
    {
      headers: {
        authtoken,
      },
    }
  );
};
// export const createOrUpdatePhoneUser = async (name, phoneNumber, authtoken) => {
//   return await axios.post(
//     `${process.env.REACT_APP_API}/create-or-update-phone-user`,
//     { name, phoneNumber },
//     {
//       headers: {
//         authtoken,
//       },
//     }
//   );
// };

export const currentUser = async (authtoken) => {
  return await axios.post(
    `${process.env.REACT_APP_API}/current-user`,
    {},
    {
      headers: {
        authtoken,
      },
    }
  );
};

export const currentAdmin = async (authtoken) => {
  return await axios.post(
    `${process.env.REACT_APP_API}/current-admin`,
    {},
    {
      headers: {
        authtoken,
      },
    }
  );
};

export const SendOTP = async (email) => {
  return await axios.post(`${process.env.REACT_APP_API}/send-otp`, { email });
};

export const verifyOTP = async (values) => {
  return await axios.post(`${process.env.REACT_APP_API}/verify-otp`, {
    values,
  });
};

export const infoOTP = async (email) => {
  return await axios.post(`${process.env.REACT_APP_API}/otpinfo`, {
    email,
  });
};
