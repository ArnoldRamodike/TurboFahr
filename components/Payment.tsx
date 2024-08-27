import { View, Text } from "react-native";
import React from "react";
import { PaymentProps } from "@/types/type";
import CustomButton from "./CustomButton";

const Payment = ({
  amount,
  driverId,
  email,
  fullName,
  rideTime,
}: PaymentProps) => {
  const openPaymentSheet = async () => {};
  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />
    </>
  );
};

export default Payment;
