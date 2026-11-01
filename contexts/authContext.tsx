import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, deleteUser, GoogleAuthProvider, onAuthStateChanged, reload, sendEmailVerification, sendPasswordResetEmail, signInWithCredential, signInWithEmailAndPassword, signOut } from "@firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserType>(null);
    const router = useRouter();

    async function updateUserData(uid: string) {
        try {
            const docSnap = await getDoc(doc(firestore, "users", uid));
            const firebaseUser = auth.currentUser;
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUser({
                    uid: data?.uid || null,
                    email: data.email || null,
                    name: data.name || null,
                    image: data.image || null,
                    emailVerified: firebaseUser?.emailVerified ?? false,
                    providerIds: firebaseUser?.providerData.map((provider) => provider.providerId) ?? [],
                });
            }
        } catch (error: any) {
            console.error("Error loading user data:", error);
        }
    }

    useEffect(()=>{
        const unSub = onAuthStateChanged(auth, (firebaseUser)=>{
            if (firebaseUser){
                setUser({
                    uid: firebaseUser?.uid,
                    email: firebaseUser?.email,
                    name: firebaseUser?.displayName,
                    image: firebaseUser?.photoURL,
                    emailVerified: firebaseUser.emailVerified,
                    providerIds: firebaseUser.providerData.map((provider) => provider.providerId),
                });
                updateUserData(firebaseUser.uid)
                router.replace("/(tabs)")
            } else {
                setUser(null)
                router.replace("/(auth)/welcome")
            }
        })
        return () => unSub();
    }, [router]);

    const login = async (email:string, password: string) => {
        try{
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true }
        } catch(error:any) {
            let msg = error.message;
            if (msg.includes("(auth/invalid-credential)")) msg = "Wrong Credentials";
            if (msg.includes("(auth/invalid-email")) msg = "Invalid Email";
            return { success: false, msg };
        }
    };
    const googleLogin = async (idToken: string, accessToken?: string) => {
        try {
            const credential = GoogleAuthProvider.credential(idToken, accessToken);
            const response = await signInWithCredential(auth, credential);
            await setDoc(doc(firestore, "users", response.user.uid), {
                uid: response.user.uid,
                email: response.user.email,
                name: response.user.displayName,
                image: response.user.photoURL,
            }, { merge: true });
            return { success: true };
        } catch (error: any) {
            let msg = error.message;
            if (msg.includes("(auth/account-exists-with-different-credential)")) {
                msg = "An account already exists with this email. Sign in with the original provider.";
            }
            return { success: false, msg };
        }
    };
    const register = async (email:string, password: string, name: string) => {
        try{
            let response = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(firestore, 'users', response?.user?.uid), {
                email, name, uid: response?.user?.uid, 
            });
            await sendEmailVerification(response.user);
            return { success: true }
        } catch(error:any) {
            let msg = error.message;
            if (msg.includes("(auth/invalid-email")) msg = "Invalid Email";
            if (msg.includes("(auth/email-already-in-use")) msg = "Email is already in use!"
            return { success: false, msg };
        }
    };
    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email.trim());
            return { success: true, msg: "Password reset instructions sent to your email." };
        } catch (error: any) {
            let msg = error.message;
            if (msg.includes("(auth/invalid-email")) msg = "Invalid Email";
            if (msg.includes("(auth/user-not-found")) msg = "No account was found for this email.";
            return { success: false, msg };
        }
    };
    const sendVerificationEmailForUser = async () => {
        try {
            if (!auth.currentUser) return { success: false, msg: "You are not signed in." };
            await reload(auth.currentUser);
            if (auth.currentUser.emailVerified) return { success: true, msg: "Your email is already verified." };
            await sendEmailVerification(auth.currentUser);
            return { success: true, msg: "Verification email sent." };
        } catch (error: any) {
            return { success: false, msg: error.message };
        }
    };
    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error: any) {
            return { success: false, msg: error.message };
        }
    };
    const deleteAccount = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return { success: false, msg: "You are not signed in." };
            const uid = currentUser.uid;
            await deleteUser(currentUser);
            await deleteDoc(doc(firestore, "users", uid));
            return { success: true };
        } catch (error: any) {
            let msg = error.message;
            if (msg.includes("(auth/requires-recent-login)")) {
                msg = "For your security, sign in again before deleting your account.";
            }
            return { success: false, msg };
        }
    };
    const contextValue: AuthContextType = {
        user,
        setUser,
        login,
        googleLogin,
        register,
        resetPassword,
        sendVerificationEmail: sendVerificationEmailForUser,
        logout,
        deleteAccount,
        updateUserData,
    }

    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
};

export const useAuth = ():AuthContextType => {
    const context = useContext(AuthContext);
    if (!context){
        throw new Error("useAuth Hook must be wrapped inside AuthProvider")
    }
    return context;
}
