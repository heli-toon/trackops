export const getProfileImage = (file:any)=>{
    if (file && typeof file == 'string') return file
    if (file && typeof file == 'object') return file.uri;

    return require('../assets/images/blank-profile-picture.png');
}