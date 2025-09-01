# Firebase Realtime Database Setup Guide

## 🔥 **Firebase Project Configuration**

Your LearnAI application requires Firebase Realtime Database to be properly configured. Follow these steps to set up your Firebase project:

---

## 📋 **Step 1: Configure Realtime Database Rules**

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Select your project: `learn-ai-a5638`

2. **Update Realtime Database Rules**
   - In the left sidebar, click **"Realtime Database"**
   - Click the **"Rules"** tab
   - Replace the default rules with the following:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "courses": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "folders": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "articles": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "projects": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "progress": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "projectProgress": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        }
      }
    }
  }
}
```

3. **Publish Rules**
   - Click **"Publish"** to save the rules

---

## 🔧 **Step 2: Enable Authentication**

1. **Go to Authentication**
   - In the left sidebar, click **"Authentication"**
   - Click **"Get started"**

2. **Enable Google Sign-In**
   - Click **"Sign-in method"** tab
   - Click **"Google"**
   - Enable it and configure:
     - **Project support email**: Your email
     - **Authorized domains**: Add your domain (for production)
   - Click **"Save"**

---

## 📱 **Step 3: Update Application Configuration**

Your Firebase configuration in `services/firebaseConfig.ts` should already be correct:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC8aK1_rY1bBGeHjbEChIjpi6Yv8VTeDL0",
  authDomain: "learn-ai-a5638.firebaseapp.com",
  projectId: "learn-ai-a5638",
  storageBucket: "learn-ai-a5638.firebasestorage.app",
  messagingSenderId: "712188207825",
  appId: "1:712188207825:web:102f1cb2cb49d73809dbf0",
  measurementId: "G-FF2CZSXCLD"
};
```

---

## 🚀 **Step 4: Test the Setup**

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test Authentication**
   - Open your app in the browser
   - Click "Sign in with Google"
   - Verify you can sign in successfully

3. **Test Database Operations**
   - Create a course or folder
   - Check Firebase Console → Realtime Database
   - Verify data is being saved

---

## 🔍 **Troubleshooting**

### **Error: "Database connection failed"**
- Ensure Realtime Database is enabled in Firebase Console
- Check that security rules are published
- Verify your Firebase configuration is correct

### **Error: "Permission denied"**
- Check Realtime Database security rules
- Ensure you're signed in with Google
- Verify the rules allow authenticated users to access their data

### **Error: "400 Bad Request"**
- Check that Realtime Database is enabled
- Verify the project ID matches your Firebase project
- Ensure you're using the correct Firebase configuration

---

## 📊 **Database Structure**

After setup, your Realtime Database will have this structure:

```json
{
  "users": {
    "userId1": {
      "email": "user@example.com",
      "displayName": "User Name",
      "photoURL": "https://...",
      "createdAt": "timestamp",
      "lastActive": "timestamp",
      "courses": {
        "courseId1": {
          "id": "courseId1",
          "title": "Course Title",
          "description": "Course Description",
          "modules": [...]
        }
      },
      "folders": {
        "folderId1": {
          "id": "folderId1",
          "name": "Folder Name",
          "courseIds": ["courseId1"],
          "articleIds": ["articleId1"]
        }
      },
      "articles": {
        "articleId1": {
          "id": "articleId1",
          "title": "Article Title",
          "content": "Article Content"
        }
      },
      "projects": {
        "projectId1": {
          "id": "projectId1",
          "title": "Project Title",
          "steps": [...]
        }
      },
      "progress": {
        "courseId1": {
          "courseId": "courseId1",
          "progress": {
            "lessonId1": 1234567890
          }
        }
      },
      "projectProgress": {
        "projectId1": {
          "projectId": "projectId1",
          "progress": {
            "stepId1": true
          }
        }
      }
    }
  }
}
```

---

## 🎯 **Production Considerations**

1. **Update Security Rules**
   - Replace test mode rules with production rules
   - Add additional security measures as needed

2. **Enable App Check**
   - Add Firebase App Check for additional security
   - Configure authorized domains

3. **Monitor Usage**
   - Set up billing alerts
   - Monitor Realtime Database usage in Firebase Console

---

## ✅ **Verification Checklist**

- [ ] Realtime Database is enabled
- [ ] Security rules are published
- [ ] Google Authentication is enabled
- [ ] Firebase configuration is correct
- [ ] Users can sign in successfully
- [ ] Data is being saved to Realtime Database
- [ ] Real-time updates are working

Once all steps are completed, your LearnAI application will have full database functionality with personalized user accounts! 🎉
