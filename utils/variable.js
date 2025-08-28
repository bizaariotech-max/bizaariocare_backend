const errorMessages = {
  __SOME_ERROR: "Some Technical Issue!\n Please try after some time",
  __LOGIN_MISSMATCH: "Incorrect username or password, please try again.",
  __FIELD_ERROR: "Failed to validate",
  __INVALID_TOKEN: "Please Enter a valid token",
  __TOKEN_EXPIRED:
    "Your token has expired due to security reasons. Please try again.",
  __NOT_AUTHORIZE:
    "Your are not authorize to access. please contact to support.",
  __DATA_404: "Data not found",
  __NOT_ALLOWED: "Not Allowed",
  __MISSING_LOOKUPCODES:
    "Lookup codes missing. Specify lookup code to fetch the corresponding list.",
  __BLANK_LOOKUPCODE:
    "There are some blank lookup codes. Please refine the lookup code list.",
  __NO_LOOKUP_LIST: "No record(s) Found for selected list of lookup type(s).",
  __LOOKUP_VALUE_MANDATORY: "Lookup value is missing.",
  __LOOKUP_TYPE_MANDATORY: "Lookup value is missing.",
  __PARENT_LOOKUP_MANDATORY: "Parent lookup required for selected lookup type.",
  __LOOKUP_SAVE_ERROR: "problem occured while saving the loookup.",
  __LOOKUP_EXIST: "Lookup already exists in selected lookup type.",
  __SERVICE_NOTAVAILABLE:
    "Thank you so much for placing your trust in us. We truly appreciate your signup. We wanted to let you know that, while we're not yet operational in your area, we're working hard to get there soon. Rest assured, we'll keep you updated and notify you as soon as our services are available in your location. Thank you for your patience and understanding!",
  __USER_EXIST:
    "You are already registered with Us. If you have forgotten Your Password then recover it by clicking “Forgot Password” link on login screen.",
  __VALIDATION_ERROR: "Filled validation error",
  __DEFAULT_CLIENT_NOTFOUND: "Default client ID not found",
  __RECORD_NOT_FOUND: "No record(s) found matching with fetch criteria.",
  __CLIENT_SAVE_ERROR: "There is some problem saving client information.",
  __DUPLICATE_CLIENT: "Duplicate client entry!",
  __DUPLICATE_ADDRESS: "Duplicate address for selected address type!",
  __ADDRESS_LABEL_MISSING:
    "In case of 'Other' address type, address label is mandatory.",
  __DUPLICATE_DOCTOR: "Duplicate doctor entry!",
  __DOCTOR_SAVE_ERROR: "There is some problem saving doctor information.",
  __DUPLICATE_PHARMACY: "Duplicate pharmacy entry!",
  __DUPLICATE_PATHOLOGY: "Duplicate Pathology entry!",
  __DUPLICATE_ENTRY:
    "Duplicate entry! The following fields have duplicates: EmailAddress, ContactNo, AssetName",
  __HOSPITAL_SAVE_ERROR: "There is some problem saving hospital information.",
};

const successMessages = {
  __SUCCESS: "Success",
  __CODE_SEND: "Verification Code Sent, please check your email.",
  __DELETE_SUCCESS: " Deleted successfully",
};

module.exports = { ...errorMessages, ...successMessages };
