import ExpoModulesCore
import Speech

public class MyVoiceModule: Module {
  private let speechRecognizer = SFSpeechRecognizer()
  private var recognitionTask: SFSpeechRecognitionTask?
  private var audioEngine = AVAudioEngine()

  public func definition() -> ModuleDefinition {
    Name("MyVoiceModule")

    Function("startListening") { () -> Void in
      self.requestPermission { granted in
        if granted {
          self.startRecognition()
        } else {
          self.sendEvent("onError", [
            "errorCode": "permission_denied",
            "message": "User denied microphone access"
          ])
        }
      }
    }

    Function("stopListening") { () -> Void in
      self.stopRecognition()
    }

    Events("onResults", "onError")
  }

  private func requestPermission(completion: @escaping (Bool) -> Void) {
    SFSpeechRecognizer.requestAuthorization { authStatus in
      switch authStatus {
      case .authorized:
        AVAudioSession.sharedInstance().requestRecordPermission { granted in
          completion(granted)
        }
      default:
        completion(false)
      }
    }
  }

  private func startRecognition() {
    print("Cleaning..")
    stopRecognition()

    print("Creating audioSession...")
    let audioSession = AVAudioSession.sharedInstance()
    print("audioSession created: \(audioSession)")
    do {
      try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
      try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
    } catch {
      sendEvent("onError", [
        "errorCode": "audio_session_error",
        "message": error.localizedDescription
      ])
      return
    }

    let inputNode = audioEngine.inputNode
    let recognitionRequest = SFSpeechAudioBufferRecognitionRequest()

    guard let speechRecognizer = speechRecognizer, speechRecognizer.isAvailable else {
      sendEvent("onError", [
        "errorCode": "recognizer_unavailable",
        "message": "Speech recognizer is not available"
      ])
      return
    }

    recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest) { result, error in
      if let error = error {
        self.sendEvent("onError", [
          "errorCode": "recognition_error",
          "message": error.localizedDescription
        ])
        self.stopRecognition()
      } else if let result = result {
        if result.isFinal {
          let recognizedText = result.bestTranscription.formattedString
          self.sendEvent("onResults", ["results": recognizedText])
          self.stopRecognition()
        }
      }
    }

    var recordingFormat = inputNode.inputFormat(forBus: 0)

    print("Input format: \(recordingFormat)")
   
    do {
      inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
      recognitionRequest.append(buffer)
    }
    } catch {
      print("Error!")
    }


    audioEngine.prepare()
    do {
      try audioEngine.start()
    } catch {
      sendEvent("onError", [
        "errorCode": "audio_engine_error",
        "message": error.localizedDescription
      ])
    }
  }

  private func stopRecognition() {
    recognitionTask?.cancel()
    recognitionTask = nil
    audioEngine.stop()
    audioEngine.inputNode.removeTap(onBus: 0)
  }
}
