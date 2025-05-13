import React from "react";
import { useGetProfileQuery, useUserProfileQuery } from "../../redux/Api/userApiSlice";

const UserDetails = () => {
   const rollNumber= localStorage.getItem("rollNumber");
   console.log(localStorage.user.data, rollNumber);
   
  const {data, isLoading, isError, error} = useUserProfileQuery();
  if(data) console.log(data);

  if (isError) {
    console.log(isError);
    
    return (
      <>
        <h1>Somting Error encountered .... </h1>
      </>
    );
  }

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Personal Details </h3>
      <ul className="space-y-2">
        <li>
          <strong>Full Name : </strong>{" "}
          {isLoading ? "loading.." : data?.fullName}
        </li>
        <li>
          <strong>University Rol Number : </strong>{" "}
          {isLoading ? "loading.." : data?.rollNumber}
        </li>
        <li>
          <strong>Gender : </strong> {isLoading ? "loading.." : data?.gender}
        </li>
        <li>
          <strong>Batch : </strong> {isLoading ? "loading.." : data?.batch}
        </li>
        <li>
          <strong>Email : </strong> {isLoading ? "loading.." : data?.email}
        </li>
      </ul>
    </div>
  );
};

export default UserDetails;
