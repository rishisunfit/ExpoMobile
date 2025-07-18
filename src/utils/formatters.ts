export const emailToFolderName = (email: string): string => {
  return email.replace(/@/g, '_at_').replace(/\./g, '_dot_');
};
 
export const folderNameToEmail = (folderName: string): string => {
  return folderName.replace(/_at_/g, '@').replace(/_dot_/g, '.');
}; 