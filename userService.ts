import { doc, updateDoc } from "firebase/firestore";
import { ResponseType, UserDataType } from "./types";
import { firestore } from "./config/firebase";

export const updateUser = async (
    uid: string,
    updatedData: UserDataType,
):Promise<ResponseType> => {
    try {
        const userRef = doc(firestore, "users", uid);
        await updateDoc(userRef, updatedData)


        return { success: true, msg: "Updated Succesfully" };
    } catch (error:any) {
        console.log("Error Updating User: ", error);
        return {success:false, msg: error?.message}
    }
}