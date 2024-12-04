package expo.modules.myvoicemodule

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.util.Log
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MyVoiceModule : Module() {
    private var speechRecognizer: SpeechRecognizer? = null
    private var recognitionIntent: Intent? = null

    // Here we define the (JSI) interface for the module - this will be accessible in javascript
    override fun definition() = ModuleDefinition {

        // Module name
        Name("MyVoiceModule")

        // The functions we'll be able to call - in this case startListening and stopListening
        Function("startListening") {
            val activity = appContext.currentActivity
                ?: throw Exception("No activity available")
            val permission = Manifest.permission.RECORD_AUDIO
            val currentActivity = appContext.currentActivity

            if (currentActivity != null && ContextCompat.checkSelfPermission(currentActivity, permission) != PackageManager.PERMISSION_GRANTED) {
              // Request permission if not granted
              ActivityCompat.requestPermissions(currentActivity, arrayOf(permission), 1)
              return@Function null
            }

            Handler(Looper.getMainLooper()).post {
              speechRecognizer = SpeechRecognizer.createSpeechRecognizer(currentActivity)
              speechRecognizer?.setRecognitionListener(recognitionListener)
              recognitionIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
              }          
              speechRecognizer?.startListening(recognitionIntent)
            }
        }

        Function("stopListening") {
            Handler(Looper.getMainLooper()).post {
              appContext.activityProvider?.currentActivity?.let { _ ->
                  speechRecognizer?.stopListening()
                  speechRecognizer?.destroy()
                  speechRecognizer = null
              }
            }
        }

        // The events we can listen to - in this case onResults and onError
        Events("onResults", "onError")
    }

    // Events for SpeechRecognizer
    private val recognitionListener = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle) {}

        override fun onBeginningOfSpeech() {}

        override fun onRmsChanged(rmsdB: Float) {}

        override fun onBufferReceived(buffer: ByteArray) {}

        override fun onEndOfSpeech() {}

        override fun onError(error: Int) {
            sendEvent("onError", mapOf(
                "errorCode" to error
            ))
        }

        override fun onResults(results: Bundle) {
            try {
              val matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION) 
              val detectedText = matches?.first()
              sendEvent("onResults", mapOf("results" to detectedText))
            } catch (e: Exception) {
              Log.e("onResults", "Error in onResults: ${e.message}", e)
            }
        }

        override fun onPartialResults(partialResults: Bundle) {}

        override fun onEvent(eventType: Int, params: Bundle) {}
    }
}
