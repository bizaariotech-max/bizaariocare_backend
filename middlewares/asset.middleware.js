const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../utils/constant");

const objectIdField = (isRequired = false) => {
  let schema = Joi.string().custom((value, helpers) => {
    // Convert empty string to null to prevent MongoDB cast errors
    if (value === "") {
      return null;
    }
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  });

  if (isRequired) {
    return schema.required().messages({
      "any.required": "This field is required",
      "string.empty": "This field cannot be empty",
      "any.invalid": "Invalid ObjectId format",
    });
  } else {
    return schema.allow("", null).optional();
  }
};

// Validation schema
const assetValidationSchema = Joi.object({
  _id: objectIdField(false),

  // Section 1: Identifier
  StationId: objectIdField(false),
  ParentAssetId: objectIdField(false),
  AssetName: Joi.string().trim().allow("", null).optional(),
  SubscriptionType: objectIdField(false),

  // Section 1.2: Categorization
  AssetCategoryLevel1: objectIdField(false),
  AssetCategoryLevel2: objectIdField(false),
  AssetCategoryLevel3: objectIdField(false),
  // new field
  HospitalDoctors: Joi.array()
    .items(objectIdField(false))
    .allow(null)
    .optional(),

  //   // Section 3: Incorporation Details
  //   RegistrationBody: Joi.string().allow("", null).optional(),
  //   RegistrationCertificate: Joi.string().allow("", null).optional(),
  //   RegistrationYear: Joi.number().allow("", null).optional(),
  //   RegistrationNumber: Joi.string().allow("", null).optional(),
  //   ValidityExpiry: Joi.date().allow("", null).optional(),

  //   // Section 4: Verification Details
  //   IncorporationCredentialCheck: Joi.boolean().allow("", null).optional(),
  //   EmploymentCheck: Joi.boolean().allow("", null).optional(),
  //   EducationalCredentialCheck: Joi.boolean().allow("", null).optional(),
  //   CriminalRecordCheck: Joi.boolean().allow("", null).optional(),
  //   PatientTestimonyCheck: Joi.boolean().allow("", null).optional(),
  //   OnlineReputationCheck: Joi.boolean().allow("", null).optional(),
  //   VerifiedBy: Joi.string().allow("", null).optional(),
  //   VerificationDate: Joi.date().allow("", null).optional(),
  //   VerificationCertificate: Joi.string().allow("", null).optional(),

  //   // Section 5: Hospital Size
  //   NumberOfDepartments: Joi.number().allow("", null).optional(),
  //   NumberOfDoctors: Joi.number().allow("", null).optional(),
  //   NumberOfConsultingPhysicians: Joi.number().allow("", null).optional(),
  //   NumberOfNursingStaff: Joi.number().allow("", null).optional(),
  //   NumberOfBeds: Joi.number().allow("", null).optional(),
  //   NumberOfICUBeds: Joi.number().allow("", null).optional(),
  //   NumberOfOTs: Joi.number().allow("", null).optional(),

  //   // Section 6: Address
  //   AddressLine1: Joi.string().allow("", null).optional(),
  //   AddressLine2: Joi.string().allow("", null).optional(),
  //   PostalCode: Joi.string().allow("", null).optional(),
  //   GeoLocation: Joi.object({
  //     type: Joi.string().valid("Point").default("Point"),
  //     coordinates: Joi.array().items(Joi.number()).length(2).allow(null).optional(),
  //   }).allow(null).optional(),

  //   // Section 7: Asset Profile
  //   ShortDescription: Joi.string().allow("", null).optional(),
  //   LongDescription: Joi.string().allow("", null).optional(),
  //   ProfilePicture: Joi.string().allow("", null).optional(),
  //   Logo: Joi.string().allow("", null).optional(),
  //   PictureGallery: Joi.array().items(Joi.string()).allow(null).optional(),
  //   VideoGallery: Joi.array().items(Joi.string()).allow(null).optional(),
  //   ProfilePDF: Joi.string().allow("", null).optional(),
  //   VideoBio: Joi.string().allow("", null).optional(),

  //   // Medical Specialties
  //   MedicalSpecialties: Joi.array().items(objectIdField(false)).allow(null).optional(),

  //   // Social Media
  //   Website: Joi.string().uri().allow("", null).optional(),
  //   YouTubeChannel: Joi.string().allow("", null).optional(),
  //   FacebookPage: Joi.string().allow("", null).optional(),
  //   InstagramAccount: Joi.string().allow("", null).optional(),
  //   LinkedInAccount: Joi.string().allow("", null).optional(),
  //   WhatsAppCommunity: Joi.string().allow("", null).optional(),
  //   TelegramChannel: Joi.string().allow("", null).optional(),

  //   // Treatment Packages
  //   TreatmentPackages: Joi.array().items(
  //     Joi.object({
  //       PackageAnnouncementDate: Joi.date().allow("", null).optional(),
  //       PackageName: Joi.string().allow("", null).optional(),
  //       PackageCurrency: objectIdField(false),
  //       PackagePrice: Joi.number().allow("", null).optional(),
  //       Discount: Joi.number().allow("", null).optional(),
  //       DiscountValidity: Joi.date().allow("", null).optional(),
  //       PackageImage: Joi.string().allow("", null).optional(),
  //       ShortDescription: Joi.string().allow("", null).optional(),
  //       LongDescription: Joi.string().allow("", null).optional(),
  //     })
  //   ).allow(null).optional(),

  //   // Payment Details
  //   AccountName: Joi.string().allow("", null).optional(),
  //   AccountNumber: Joi.string().allow("", null).optional(),
  //   BankName: Joi.string().allow("", null).optional(),
  //   SwiftIFSCCode: Joi.string().allow("", null).optional(),
  //   PaymentQRCode: Joi.string().allow("", null).optional(),
  //   OnlinePaymentURL: Joi.string().uri().allow("", null).optional(),

  //   // Fees and Charges
  //   FeesAndCharges: Joi.array().items(
  //     Joi.object({
  //       ServiceCategory: objectIdField(false),
  //       FeeCurrency: objectIdField(false),
  //       FeeAmount: Joi.number().allow("", null).optional(),
  //     })
  //   ).allow(null).optional(),

  //   // OPD Schedule
  //   OPDSchedule: Joi.array().items(
  //     Joi.object({
  //       OPDDay: Joi.string().valid(
  //         "Monday", "Tuesday", "Wednesday", "Thursday",
  //         "Friday", "Saturday", "Sunday"
  //       ).allow("", null).optional(),
  //       OPDTimeFrom: Joi.string().allow("", null).optional(),
  //       OPDTimeTo: Joi.string().allow("", null).optional(),
  //       AvailableSlots: Joi.number().allow("", null).optional(),
  //     })
  //   ).allow(null).optional(),

  //   // Online Clinic
  //   OnlineClinicLink: Joi.string().uri().allow("", null).optional(),

  //   // Contact Details
  //   ContactName: Joi.string().allow("", null).optional(),
  //   ContactPhoneNumber: Joi.string().allow("", null).optional(),
  //   ContactEmailAddress: Joi.string().email().allow("", null).optional(),

  //   // Asset Admins
  //   AssetAdmins: Joi.array().items(
  //     Joi.object({
  //       Name: Joi.string().allow("", null).optional(),
  //       Email: Joi.string().email().allow("", null).optional(),
  //       PhoneNumber: Joi.string().allow("", null).optional(),
  //       Password: Joi.string().allow("", null).optional(),
  //     })
  //   ).allow(null).optional(),

  //   // Asset Mapping
  //   AssetMapping: Joi.array().items(objectIdField(false)).allow(null).optional(),

  // Status
  //   IsActive: Joi.boolean().allow("", null).optional(),
});

const validateSaveAsset = (req, res, next) => {
  const { error } = assetValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error.details.map((d) => d.message).join(". "),
      })
    );
  }
  next();
};

module.exports = {
  validateSaveAsset,
};