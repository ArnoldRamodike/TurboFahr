import { View, Text, Alert, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { PaymentProps } from "@/types/type";
import CustomButton from "./CustomButton";
import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";
import { images } from "@/constants";
import ReactNativeModal from "react-native-modal";
import { router } from "expo-router";

const Payment = ({
  amount,
  driverId,
  email,
  fullName,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [success, setSuccess] = useState(false);
  const { userId } = useAuth();
  const {
    userLatitude,
    userLongitude,
    destinationAddress,
    destinationLatitude,
    destinationLongitude,
    setDestinationLocation,
    setUserLocation,
    userAddress,
  } = useLocationStore();

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Ryde Inc",
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: "ZAR",
        },
        confirmHandler: async (paymentMethod, _, intentCreationCallback) => {
          // Make a request to your own server.
          const { paymentIntent, customer } = await fetchAPI(
            "(api)/(stripe)/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount: amount,
                paymentMethodId: paymentMethod.id,
              }),
            }
          );
          if (paymentIntent.client_secret) {
            const { result } = await fetchAPI("(api)/(stripe)/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intend_id: paymentIntent.id,
                customer_id: customer,
              }),
            });
            if (result.client_secret) {
              // API call
              await fetchAPI("/(api)/ride/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  origin_address: userAddress,
                  destination_address: destinationAddress,
                  origin_latitude: userLatitude,
                  origin_longitude: userLongitude,
                  destination_latitude: destinationLatitude,
                  destination_longitude: destinationLongitude,
                  ride_time: rideTime.toFixed(0),
                  fare_price: parseInt(amount) * 100,
                  payment_status: "paid",
                  driver_id: driverId,
                  user_id: userId,
                }),
              });

              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      returnURL: "myapp://book-ride",
    });
    if (error) {
      // handle error
      console.log(error);
    }
  };

  const openPaymentSheet = async () => {
    await initializePaymentSheet();
    const { error } = await presentPaymentSheet();

    if (error) {
      // Customer canceled - you should probably do nothing.
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      // PaymentSheet encountered an unrecoverable error. You can display the error to the user, log it, etc.
      setSuccess(true);
    }
  };
  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />
          <Text className="text-center text-2xl font-JakartaBold mt-5">
            Ride booked{" "}
          </Text>
          <Text className="text-sm text-general-200 font-JakartaMedium text-center mt-3 ">
            Thank you for our booking. Your reservation has been received,
            proceed with your trip.{" "}
          </Text>
          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
