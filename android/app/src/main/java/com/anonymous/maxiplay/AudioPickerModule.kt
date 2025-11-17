package com.anonymous.maxiplay

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import com.facebook.react.bridge.*

class AudioPickerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var pickerPromise: Promise? = null
    private val AUDIO_REQUEST_CODE = 12345

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "AudioPicker"

    @ReactMethod
    fun pickAudio(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not found")
            return
        }

        pickerPromise = promise

        try {
            val intent = Intent(Intent.ACTION_GET_CONTENT)
            intent.type = "audio/*"
            intent.addCategory(Intent.CATEGORY_OPENABLE)
            activity.startActivityForResult(
                Intent.createChooser(intent, "Select Audio"),
                AUDIO_REQUEST_CODE
            )
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
            pickerPromise = null
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != AUDIO_REQUEST_CODE) return

        if (pickerPromise == null) return

        if (resultCode == Activity.RESULT_CANCELED) {
            pickerPromise?.reject("CANCELLED", "User cancelled audio picker")
            pickerPromise = null
            return
        }

        if (resultCode == Activity.RESULT_OK && data != null) {
            val uri: Uri? = data.data
            if (uri != null) {
                val fileInfo = getFileInfo(uri)
                pickerPromise?.resolve(fileInfo)
            } else {
                pickerPromise?.reject("NO_FILE", "No audio file selected")
            }
        }
        pickerPromise = null
    }

    override fun onNewIntent(intent: Intent) {
        // Méthode requise par ActivityEventListener
    }

    private fun getFileInfo(uri: Uri): WritableMap {
        val map = Arguments.createMap()
        val cursor = reactApplicationContext.contentResolver.query(uri, null, null, null, null)
        var name: String? = "unknown"
        var size: Long = 0
        cursor?.use {
            if (it.moveToFirst()) {
                val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                val sizeIndex = it.getColumnIndex(OpenableColumns.SIZE)
                if (nameIndex != -1) name = it.getString(nameIndex)
                if (sizeIndex != -1) size = it.getLong(sizeIndex)
            }
        }
        map.putString("uri", uri.toString())
        map.putString("name", name)
        map.putString("type", "audio/*")
        map.putDouble("size", size.toDouble())
        map.putString("fileCopyUri", uri.toString())
        return map
    }
}