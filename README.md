# React Native Captions Clone with Convex, ElevenLabs, Sentry and Expo

This is a React Native Captions clone using [Convex](https://www.convex.dev/) for real-time data synchronization, [ElevenLabs](https://elevenlabs.io/) for text-to-speech, [Clerk](https://go.clerk.com/1vaJMZL) for user authentication and [Sentry](https://sentry.io/welcome?utm_source=simongrimm&utm_medium=paid-community&utm_campaign=mobile-fy25q3-builders&utm_content=partner-react-native-mobile-learnmore&code=simongrimm) for error tracking.

Additional features:

- [Expo Router](https://docs.expo.dev/routing/introduction/) file-based navigation
- [Convex Database](https://docs.convex.dev/database) for data storage
- [Convex File Storage](https://docs.convex.dev/file-storage) for file storage
- [Convex Actions](https://supabase.com/edge-functions) for push notifications
- - [Sentry](https://docs.sentry.io/platforms/react-native/?utm_source=simongrimm&utm_medium=paid-community&utm_campaign=mobile-fy25q3-builders&utm_content=partner-react-native-mobile-trysentry&code=simongrimm) for error tracking
- [Clerk Passkeys](https://docs.clerk.com/passkeys/overview) for passwordless authentication
- [Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) for haptic feedback
- [Jotai](https://jotai.pmnd.rs/) for state management
- [NativeWind](https://www.nativewind.dev/) for styling
- [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) for gradient backgrounds
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/secure-store/) for secure storage
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/image-picker/) for image picking
- [Expo Video](https://docs.expo.dev/versions/latest/sdk/video/) for video playback
- [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/) for audio playback

### 🎥 Follow the video tutorial

Watch and build this Captions clone step by step:

TODO: Add video
<p align="center">
  <a href="https://youtu.be/A8gJFybTPr0?si=MbVOcnPJEfRWCOmi" target="_blank">
    <!-- <img src="https://img.youtube.com/vi/A8gJFybTPr0/maxresdefault.jpg" alt="Build a React Native Captions Clone with Convex, ElevenLabs, Sentry and Expo" width="100%" /> -->
  </a>
</p>



## Setup



### Environment Setup

Make sure you have the [Expo CLI](https://docs.expo.dev/get-started/set-up-your-environment/) installed.

For the best development experience, you should have [Android Studio](https://developer.android.com/studio) and [Xcode](https://developer.apple.com/xcode/) (Mac only) installed. For more information on setting up your development environment, refer to the [Expo documentation](https://docs.expo.dev/workflow/android-studio-emulator/) for Android Studio and the [React Native documentation](https://reactnative.dev/docs/environment-setup?guide=native) for Xcode.

### App Setup

To build the app, follow these steps:

1. Clone the repository
2. Run `npm install`
3. Run `npx expo prebuild`
4. Run `npx expo run:ios` or `npx expo run:android`

### Convex Setup

1. Create an account on [Convex](https://www.convex.dev/)
2. Run `bunx convex dev` to start the development server

## Clerk Setup

Make sure to add your `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to the `.env` file.

### Authentication Setup

Create a [Clerk](https://clerk.com/) account and project, then update the `convex/auth.config.js` file with your `domain` and `applicationID`.

```js
export default {
  providers: [
    {
      domain: 'https://your-clerk-domain.clerk.accounts.dev',
      applicationID: 'your-clerk-application-id',
    },
  ],
};
```

You also need to connect Convex and Clerk with a JWT template. For this, cehck out the video and [Convex docs](https://docs.convex.dev/auth/clerk).

### ElevenLabs Setup

1. Create an account on [ElevenLabs](https://elevenlabs.io/)
2. Get an API key from [ElevenLabs](https://elevenlabs.io/api-keys)
3. Add the key to Convex by running `bunx convex env set ELEVENLABS_API_KEY=<your-api-key>`

<img src="./screenshots/elevenlabs.png">

### Sentry Setup

1. Create a new project on [Sentry](https://sentry.io/welcome?utm_source=simongrimm&utm_medium=paid-community&utm_campaign=mobile-fy25q3-builders&utm_content=partner-react-native-mobile-learnmore&code=simongrimm)
2. Use the `bunx @sentry/wizard@latest -i reactNative --saas` command to setup Sentry for your project

## App Screenshots

<div style="display: flex; flex-direction: 'row';">
[Your app screenshots will go here]
</div>

## 🚀 More

**Take a shortcut from web developer to mobile development fluency with guided learning**

Enjoyed this project? Learn to use React Native to build production-ready, native mobile apps for both iOS and Android based on your existing web development skills.

<a href="https://galaxies.dev"><img src="banner.png" height="auto" width="100%"></a>