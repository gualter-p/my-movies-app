import { NativeModule, requireNativeModule } from "expo-modules-core";

import { MyVoiceModuleEvents } from "./MyVoiceModule.types";

declare class MyVoiceModule extends NativeModule<MyVoiceModuleEvents> {
  startListening(): void;
  stopListening(): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MyVoiceModule>("MyVoiceModule");
