const mongoose = require("mongoose");

// ASSET MASTER SCHEMA
const AssetMasterSchema = new mongoose.Schema(
  {
    // -------------------------
    // Section 1: Identifier
    // -------------------------
    StationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "station_master",
    },
    ParentAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "asset_master",
    },
    AssetName: {
      type: String,
      trim: true,
    },
    // AssetMapping: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "asset_master",
    //   },
    // ],
    SubscriptionType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
    // -------------------------
    // Section 1.2: Categorization --  it come under section 1
    // -------------------------
    AssetCategoryLevel1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups", // category
    },
    AssetCategoryLevel2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups", // sub category
    },
    AssetCategoryLevel3: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups", // sub sub category - level 3
    },

    // -------------------------
    // Section 3: Incorporation Details
    // -------------------------
    RegistrationBody: String,
    RegistrationCertificate: String, // file upload path
    RegistrationYear: Number,
    RegistrationNumber: String,
    ValidityExpiry: Date,

    // -------------------------
    // Section 4: Verification Details
    // -------------------------
    IncorporationCredentialCheck: { type: Boolean, default: false },
    EmploymentCheck: { type: Boolean, default: false },
    EducationalCredentialCheck: { type: Boolean, default: false },
    CriminalRecordCheck: { type: Boolean, default: false },
    PatientTestimonyCheck: { type: Boolean, default: false },
    OnlineReputationCheck: { type: Boolean, default: false },
    VerifiedBy: String,
    VerificationDate: Date,
    VerificationCertificate: String,

    // -------------------------
    // Section 5: Hospital Size
    // -------------------------
    NumberOfDepartments: Number,
    NumberOfDoctors: Number,
    NumberOfConsultingPhysicians: Number,
    NumberOfNursingStaff: Number,
    NumberOfBeds: Number,
    NumberOfICUBeds: Number,
    NumberOfOTs: Number,

    // -------------------------
    // Section 6: Address
    // -------------------------
    AddressLine1: String,
    AddressLine2: String,
    PostalCode: String,
    GeoLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat]
    },

    // -------------------------
    // Section 7: Asset Profile
    // -------------------------
    ShortDescription: String,
    LongDescription: String,
    ProfilePicture: String,
    Logo: String,
    PictureGallery: [String],
    VideoGallery: [String],
    ProfilePDF: String,
    VideoBio: String, // Virtual tour link

    // -------------------------
    // Section 8: Medical Specialties
    // -------------------------
    MedicalSpecialties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // -------------------------
    // Section 9: Social Media Assets
    // -------------------------
    Website: String,
    YouTubeChannel: String,
    FacebookPage: String,
    InstagramAccount: String,
    LinkedInAccount: String,
    WhatsAppCommunity: String,
    TelegramChannel: String,

    // -------------------------
    // Section 10: Treatment Packages (Multiple)
    // -------------------------
    TreatmentPackages: [
      {
        PackageAnnouncementDate: Date,
        PackageName: String,
        PackageCurrency: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "admin_lookups", // currency lookup
        },
        PackagePrice: Number,
        Discount: Number,
        DiscountValidity: Date,
        PackageImage: String,
        ShortDescription: String,
        LongDescription: String,
      },
    ],

    // -------------------------
    // Section 11: Bank Details
    // -------------------------
    AccountName: String,
    AccountNumber: String,
    BankName: String,
    SwiftIFSCCode: String,
    PaymentQRCode: String,
    OnlinePaymentURL: String,

    // -------------------------
    // Section 12: Fee & Charges (Multiple)
    // -------------------------
    FeesAndCharges: [
      {
        ServiceCategory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "admin_lookups",
        },
        FeeCurrency: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "admin_lookups",
        },
        FeeAmount: Number,
      },
    ],

    // -------------------------
    // Section 13: OPD Schedule (Multiple)
    // -------------------------
    OPDSchedule: [
      {
        OPDDay: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        OPDTimeFrom: String,
        OPDTimeTo: String,
        AvailableSlots: Number,
      },
    ],

    // -------------------------
    // Section 14: Online Clinic
    // -------------------------
    OnlineClinicLink: String,

    // -------------------------
    // Section 15: Contact Information
    // -------------------------
    ContactName: String,
    ContactPhoneNumber: String,
    ContactEmailAddress: String,

    // // -------------------------
    // // Section 16: Asset Admin (Multiple)  removed section
    // // -------------------------
    // AssetAdmins: [
    //   {
    //     Name: String,
    //     Email: String,
    //     PhoneNumber: String,
    //     Password: String,
    //   },
    // ],
    // -------------------------
    // Section 17: Bussiness mapping - Asset Mapping (Multiple) --- for linkn
    // -------------------------
    AssetMapping: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "asset_master",
      },
    ],

    // -------------------------
    // System Fields
    // -------------------------
    IsActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// // Compound index examples
// AssetMasterSchema.index({ AssetTypeID: 1, CityId: 1 }); // quick filtering by type + city
// AssetMasterSchema.index({ ParentID: 1, AssetName: 1 }); // child lookup + search by name
// AssetMasterSchema.index({ "TreatmentPackages.PackageName": 1 }); // search inside embedded docs


module.exports = mongoose.model("asset_master", AssetMasterSchema);
