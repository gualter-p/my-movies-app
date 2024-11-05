import { useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";

// Checks if the device we're on allows biometric auth
export const useCheckBiometrics = () => {
  const [isBiometricsSupported, setIsBiometricsSupported] = useState(false);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricsSupported(compatible && enrolled);
  };

  useEffect(() => {
    checkBiometrics();
  }, []);

  return {
    isBiometricsSupported,
  };
};
