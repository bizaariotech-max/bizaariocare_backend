const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../utils/constant");

const objectIdField = (isRequired = false) => {
  let schema = Joi.string().custom((value, helpers) => {
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

// Section 3: Incorporation Details Validation
const incorporationDetailsSchema = Joi.object({
  RegistrationBody: Joi.string().optional().allow("", null),
  RegistrationCertificate: Joi.string().optional().allow("", null),
  RegistrationYear: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  RegistrationNumber: Joi.string().optional().allow("", null),
  ValidityExpiry: Joi.date().optional().allow(null),
});

// Section 4: Verification Details Validation
const verificationDetailsSchema = Joi.object({
  IncorporationCredentialCheck: Joi.boolean().optional(),
  EmploymentCheck: Joi.boolean().optional(),
  EducationalCredentialCheck: Joi.boolean().optional(),
  CriminalRecordCheck: Joi.boolean().optional(),
  PatientTestimonyCheck: Joi.boolean().optional(),
  OnlineReputationCheck: Joi.boolean().optional(),
  VerifiedBy: Joi.string().optional().allow("", null),
  VerificationDate: Joi.date().optional().allow(null),
  VerificationCertificate: Joi.string().optional().allow("", null),
});

// Section 5: Hospital Size Validation
const hospitalSizeSchema = Joi.object({
  NumberOfDepartments: Joi.number().integer().min(0).optional(),
  NumberOfDoctors: Joi.number().integer().min(0).optional(),
  NumberOfConsultingPhysicians: Joi.number().integer().min(0).optional(),
  NumberOfNursingStaff: Joi.number().integer().min(0).optional(),
  NumberOfBeds: Joi.number().integer().min(0).optional(),
  NumberOfICUBeds: Joi.number().integer().min(0).optional(),
  NumberOfOTs: Joi.number().integer().min(0).optional(),
});

// Section 6: Address Validation
const addressSchema = Joi.object({
  AddressLine1: Joi.string().optional().allow("", null),
  AddressLine2: Joi.string().optional().allow("", null),
  PostalCode: Joi.string().optional().allow("", null),
  GeoLocation: Joi.object({
    type: Joi.string().valid("Point").default("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2).optional(),
  }).optional(),
});

// Section 7: Asset Profile Validation
const assetProfileSchema = Joi.object({
  ShortDescription: Joi.string().optional().allow("", null),
  LongDescription: Joi.string().optional().allow("", null),
  ProfilePicture: Joi.string().optional().allow("", null),
  Logo: Joi.string().optional().allow("", null),
  PictureGallery: Joi.array().items(Joi.string()).optional(),
  VideoGallery: Joi.array().items(Joi.string()).optional(),
  ProfilePDF: Joi.string().optional().allow("", null),
  VideoBio: Joi.string().optional().allow("", null),
});

// Section 8: Medical Specialties Validation
const medicalSpecialtiesSchema = Joi.object({
  MedicalSpecialties: Joi.array().items(objectIdField()).optional(),
});

// Section 9: Social Media Validation
const socialMediaSchema = Joi.object({
  Website: Joi.string().uri().optional().allow("", null),
  YouTubeChannel: Joi.string().uri().optional().allow("", null),
  FacebookPage: Joi.string().uri().optional().allow("", null),
  InstagramAccount: Joi.string().optional().allow("", null),
  LinkedInAccount: Joi.string().uri().optional().allow("", null),
  WhatsAppCommunity: Joi.string().optional().allow("", null),
  TelegramChannel: Joi.string().optional().allow("", null),
});

// Section 10: Treatment Package Validation
// const treatmentPackageSchema = Joi.object({
//   PackageAnnouncementDate: Joi.date().optional(),
//   PackageName: Joi.string().required().messages({
//     "any.required": "Package name is required",
//   }),
//   PackageCurrency: objectIdField().optional(),
//   PackagePrice: Joi.number().min(0).optional(),
//   Discount: Joi.number().min(0).max(100).optional(),
//   DiscountValidity: Joi.date().optional(),
//   PackageImage: Joi.string().optional().allow("", null),
//   ShortDescription: Joi.string().optional().allow("", null),
//   LongDescription: Joi.string().optional().allow("", null),
// });

const treatmentPackageSchema = Joi.array().items(
  Joi.object({
    PackageAnnouncementDate: Joi.date().optional(),
    PackageName: Joi.string().required().messages({
      "any.required": "Package name is required",
    }),
    PackageCurrency: objectIdField().optional(),
    PackagePrice: Joi.number().min(0).optional(),
    Discount: Joi.number().min(0).max(100).optional(),
    DiscountValidity: Joi.date().optional(),
    PackageImage: Joi.string().optional().allow("", null),
    ShortDescription: Joi.string().optional().allow("", null),
    LongDescription: Joi.string().optional().allow("", null),
  })
);

// Section 11: Bank Details Validation
const bankDetailsSchema = Joi.object({
  AccountName: Joi.string().optional().allow("", null),
  AccountNumber: Joi.string().optional().allow("", null),
  BankName: Joi.string().optional().allow("", null),
  SwiftIFSCCode: Joi.string().optional().allow("", null),
  PaymentQRCode: Joi.string().optional().allow("", null),
  OnlinePaymentURL: Joi.string().uri().optional().allow("", null),
});

// Section 12: Fee Charge Validation
// const feeChargeSchema = Joi.object({
//   ServiceCategory: objectIdField().required().messages({
//     "any.required": "Service category is required",
//   }),
//   FeeCurrency: objectIdField().optional(),
//   FeeAmount: Joi.number().min(0).required().messages({
//     "any.required": "Fee amount is required",
//   }),
// });

const feeChargeSchema = Joi.array()
  .items(
    Joi.object({
      ServiceCategory: objectIdField().required().messages({
        "any.required": "Service category is required",
      }),
      FeeCurrency: objectIdField().optional(),
      FeeAmount: Joi.number().min(0).required().messages({
        "any.required": "Fee amount is required",
      }),
    })
  )
  .required()
  .messages({
    "any.required": "Fees and charges array is required",
  });

// Section 13: OPD Schedule Validation
// const opdScheduleSchema = Joi.object({
//   OPDDay: Joi.string().valid(
//     "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
//   ).required().messages({
//     "any.required": "OPD day is required",
//   }),
//   OPDTimeFrom: Joi.string().required().messages({
//     "any.required": "OPD time from is required",
//   }),
//   OPDTimeTo: Joi.string().required().messages({
//     "any.required": "OPD time to is required",
//   }),
//   AvailableSlots: Joi.number().integer().min(0).optional(),
// });

const opdScheduleSchema = Joi.array().items(
  Joi.object({
    OPDDay: Joi.string()
      .valid(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      )
      .required()
      .messages({
        "any.required": "OPD day is required",
      }),
    OPDTimeFrom: Joi.string().required().messages({
      "any.required": "OPD time from is required",
    }),
    OPDTimeTo: Joi.string().required().messages({
      "any.required": "OPD time to is required",
    }),
    AvailableSlots: Joi.number().integer().min(0).optional(),
  })
);

// Section 14: Online Clinic Validation
const onlineClinicSchema = Joi.object({
  OnlineClinicLink: Joi.string().uri().optional().allow("", null),
});

// Section 15: Contact Info Validation
const contactInfoSchema = Joi.object({
  ContactName: Joi.string().optional().allow("", null),
  ContactPhoneNumber: Joi.string().optional().allow("", null),
  ContactEmailAddress: Joi.string().email().optional().allow("", null),
});

// Section 17: Asset Mapping Validation
const assetMappingSchema = Joi.object({
  MappedAssetId: objectIdField(true).messages({
    "any.required": "Mapped asset ID is required",
  }),
});

// Validation middleware functions
const validateIncorporationDetails = (req, res, next) => {
  const { error } = incorporationDetailsSchema.validate(req.body, {
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

const validateVerificationDetails = (req, res, next) => {
  const { error } = verificationDetailsSchema.validate(req.body, {
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

const validateHospitalSize = (req, res, next) => {
  const { error } = hospitalSizeSchema.validate(req.body, {
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

const validateAddress = (req, res, next) => {
  const { error } = addressSchema.validate(req.body, { abortEarly: false });
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

const validateAssetProfile = (req, res, next) => {
  const { error } = assetProfileSchema.validate(req.body, {
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

const validateMedicalSpecialties = (req, res, next) => {
  const { error } = medicalSpecialtiesSchema.validate(req.body, {
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

const validateSocialMedia = (req, res, next) => {
  const { error } = socialMediaSchema.validate(req.body, { abortEarly: false });
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

const validateTreatmentPackage = (req, res, next) => {
  const { error } = treatmentPackageSchema.validate(req.body, {
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

const validateBankDetails = (req, res, next) => {
  const { error } = bankDetailsSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error,
      })
    );
  }
  next();
};

const validateFeeCharge = (req, res, next) => {
  const { error } = feeChargeSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error,
      })
    );
  }
  next();
};

const validateOPDSchedule = (req, res, next) => {
  const { error } = opdScheduleSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error,
      })
    );
  }
  next();
};

const validateOnlineClinic = (req, res, next) => {
  const { error } = onlineClinicSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error,
      })
    );
  }
  next();
};

const validateContactInfo = (req, res, next) => {
  const { error } = contactInfoSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error,
      })
    );
  }
  next();
};

const validateAssetMapping = (req, res, next) => {
  const { error } = assetMappingSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error,
      })
    );
  }
  next();
};

module.exports = {
  validateIncorporationDetails,
  validateVerificationDetails,
  validateHospitalSize,
  validateAddress,
  validateAssetProfile,
  validateMedicalSpecialties,
  validateSocialMedia,
  validateTreatmentPackage,
  validateBankDetails,
  validateFeeCharge,
  validateOPDSchedule,
  validateOnlineClinic,
  validateContactInfo,
  validateAssetMapping,
};
// const Joi = require("joi");
// const mongoose = require("mongoose");
// const { __requestResponse } = require("../utils/constant");

// const objectIdField = (isRequired = false) => {
//   let schema = Joi.string().custom((value, helpers) => {
//     if (value === "") {
//       return null;
//     }
//     if (value && !mongoose.Types.ObjectId.isValid(value)) {
//       return helpers.error("any.invalid");
//     }
//     return value;
//   });

//   if (isRequired) {
//     return schema.required().messages({
//       "any.required": "This field is required",
//       "string.empty": "This field cannot be empty",
//       "any.invalid": "Invalid ObjectId format",
//     });
//   } else {
//     return schema.allow("", null).optional();
//   }
// };

// // Section 3: Incorporation Details Validation
// const incorporationDetailsSchema = Joi.object({
//   RegistrationBody: Joi.string().optional().allow("", null),
//   RegistrationCertificate: Joi.string().optional().allow("", null),
//   RegistrationYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
//   RegistrationNumber: Joi.string().optional().allow("", null),
//   ValidityExpiry: Joi.date().optional().allow(null),
// });

// // Section 4: Verification Details Validation
// const verificationDetailsSchema = Joi.object({
//   IncorporationCredentialCheck: Joi.boolean().optional(),
//   EmploymentCheck: Joi.boolean().optional(),
//   EducationalCredentialCheck: Joi.boolean().optional(),
//   CriminalRecordCheck: Joi.boolean().optional(),
//   PatientTestimonyCheck: Joi.boolean().optional(),
//   OnlineReputationCheck: Joi.boolean().optional(),
//   VerifiedBy: Joi.string().optional().allow("", null),
//   VerificationDate: Joi.date().optional().allow(null),
//   VerificationCertificate: Joi.string().optional().allow("", null),
// });

// // Section 5: Hospital Size Validation
// const hospitalSizeSchema = Joi.object({
//   NumberOfDepartments: Joi.number().integer().min(0).optional(),
//   NumberOfDoctors: Joi.number().integer().min(0).optional(),
//   NumberOfConsultingPhysicians: Joi.number().integer().min(0).optional(),
//   NumberOfNursingStaff: Joi.number().integer().min(0).optional(),
//   NumberOfBeds: Joi.number().integer().min(0).optional(),
//   NumberOfICUBeds: Joi.number().integer().min(0).optional(),
//   NumberOfOTs: Joi.number().integer().min(0).optional(),
// });

// // Section 6: Address Validation
// const addressSchema = Joi.object({
//   AddressLine1: Joi.string().optional().allow("", null),
//   AddressLine2: Joi.string().optional().allow("", null),
//   PostalCode: Joi.string().optional().allow("", null),
//   GeoLocation: Joi.object({
//     type: Joi.string().valid("Point").default("Point"),
//     coordinates: Joi.array().items(Joi.number()).length(2).optional(),
//   }).optional(),
// });

// // Section 7: Asset Profile Validation
// const assetProfileSchema = Joi.object({
//   ShortDescription: Joi.string().optional().allow("", null),
//   LongDescription: Joi.string().optional().allow("", null),
//   ProfilePicture: Joi.string().optional().allow("", null),
//   Logo: Joi.string().optional().allow("", null),
//   PictureGallery: Joi.array().items(Joi.string()).optional(),
//   VideoGallery: Joi.array().items(Joi.string()).optional(),
//   ProfilePDF: Joi.string().optional().allow("", null),
//   VideoBio: Joi.string().optional().allow("", null),
// });

// // Section 8: Medical Specialties Validation
// const medicalSpecialtiesSchema = Joi.object({
//   MedicalSpecialties: Joi.array().items(objectIdField()).optional(),
// });

// // Section 9: Social Media Validation
// const socialMediaSchema = Joi.object({
//   Website: Joi.string().uri().optional().allow("", null),
//   YouTubeChannel: Joi.string().uri().optional().allow("", null),
//   FacebookPage: Joi.string().uri().optional().allow("", null),
//   InstagramAccount: Joi.string().optional().allow("", null),
//   LinkedInAccount: Joi.string().uri().optional().allow("", null),
//   WhatsAppCommunity: Joi.string().optional().allow("", null),
//   TelegramChannel: Joi.string().optional().allow("", null),
// });

// // Section 10: Treatment Package Validation
// const treatmentPackageSchema = Joi.object({
//   PackageAnnouncementDate: Joi.date().optional(),
//   PackageName: Joi.string().required().messages({
//     "any.required": "Package name is required",
//   }),
//   PackageCurrency: objectIdField().optional(),
//   PackagePrice: Joi.number().min(0).optional(),
//   Discount: Joi.number().min(0).max(100).optional(),
//   DiscountValidity: Joi.date().optional(),
//   PackageImage: Joi.string().optional().allow("", null),
//   ShortDescription: Joi.string().optional().allow("", null),
//   LongDescription: Joi.string().optional().allow("", null),
// });

// // Section 11: Bank Details Validation
// const bankDetailsSchema = Joi.object({
//   AccountName: Joi.string().optional().allow("", null),
//   AccountNumber: Joi.string().optional().allow("", null),
//   BankName: Joi.string().optional().allow("", null),
//   SwiftIFSCCode: Joi.string().optional().allow("", null),
//   PaymentQRCode: Joi.string().optional().allow("", null),
//   OnlinePaymentURL: Joi.string().uri().optional().allow("", null),
// });

// // Section 12: Fee Charge Validation
// const feeChargeSchema = Joi.object({
//   ServiceCategory: objectIdField().required().messages({
//     "any.required": "Service category is required",
//   }),
//   FeeCurrency: objectIdField().optional(),
//   FeeAmount: Joi.number().min(0).required().messages({
//     "any.required": "Fee amount is required",
//   }),
// });

// // Section 13: OPD Schedule Validation
// const opdScheduleSchema = Joi.object({
//   OPDDay: Joi.string().valid(
//     "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
//   ).required().messages({
//     "any.required": "OPD day is required",
//   }),
//   OPDTimeFrom: Joi.string().required().messages({
//     "any.required": "OPD time from is required",
//   }),
//   OPDTimeTo: Joi.string().required().messages({
//     "any.required": "OPD time to is required",
//   }),
//   AvailableSlots: Joi.number().integer().min(0).optional(),
// });

// // Section 14: Online Clinic Validation
// const onlineClinicSchema = Joi.object({
//   OnlineClinicLink: Joi.string().uri().optional().allow("", null),
// });

// // Section 15: Contact Info Validation
// const contactInfoSchema = Joi.object({
//   ContactName: Joi.string().optional().allow("", null),
//   ContactPhoneNumber: Joi.string().optional().allow("", null),
//   ContactEmailAddress: Joi.string().email().optional().allow("", null),
// });

// // Section 17: Asset Mapping Validation
// const assetMappingSchema = Joi.object({
//   MappedAssetId: objectIdField(true).messages({
//     "any.required": "Mapped asset ID is required",
//   }),
// });

// // Validation middleware functions
// const validateIncorporationDetails = (req, res, next) => {
//   const { error } = incorporationDetailsSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error: error.details.map((d) => d.message).join(". "),
//       })
//     );
//   }
//   next();
// };

// const validateVerificationDetails = (req, res, next) => {
//   const { error } = verificationDetailsSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error: error.details.map((d) => d.message).join(". "),
//       })
//     );
//   }
//   next();
// };

// const validateHospitalSize = (req, res, next) => {
//   const { error } = hospitalSizeSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error: error.details.map((d) => d.message).join(". "),
//       })
//     );
//   }
//   next();
// };

// const validateAddress = (req, res, next) => {
//   const { error } = addressSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error: error.details.map((d) => d.message).join(". "),
//       })
//     );
//   }
//   next();
// };

// const validateAssetProfile = (req, res, next) => {
//   const { error } = assetProfileSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error: error.details.map((d) => d.message).join(". "),
//       })
//     );
//   }
//   next();
// };

// const validateMedicalSpecialties = (req, res, next) => {
//   const { error } = medicalSpecialtiesSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error: error.details.map((d) => d.message).join(". "),
//       })
//     );
//   }
//   next();
// };

// const validateSocialMedia = (req, res, next) => {
//   const { error } = socialMediaSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error: error.details.map((d) => d.message).join(". "),
//       })
//     );
//   }
//   next();
// };

// const validateTreatmentPackage = (req, res, next) => {
//   const { error } = treatmentPackageSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error: error.details.map((d) => d.message).join(". "),
//       })
//     );
//   }
//   next();
// };

// const validateBankDetails = (req, res, next) => {
//   const { error } = bankDetailsSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error
//       })
//     );
//   }
//   next();
// };

// const validateFeeCharge = (req, res, next) => {
//   const { error } = feeChargeSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error
//       })
//     );
//   }
//   next();
// };

// const validateOPDSchedule = (req, res, next) => {
//   const { error } = opdScheduleSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error
//       })
//     );
//   }
//   next();
// };

// const validateOnlineClinic = (req, res, next) => {
//   const { error } = onlineClinicSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error
//       })
//     );
//   }
//   next();
// };

// const validateContactInfo = (req, res, next) => {
//   const { error } = contactInfoSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error
//       })
//     );
//   }
//   next();
// };

// const validateAssetMapping = (req, res, next) => {
//   const { error } = assetMappingSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error
//       })
//     );
//   }
//   next();
// };

// module.exports = {
//   validateIncorporationDetails,
//   validateVerificationDetails,
//   validateHospitalSize,
//   validateAddress,
//   validateAssetProfile,
//   validateMedicalSpecialties,
//   validateSocialMedia,
//   validateTreatmentPackage,
//   validateBankDetails,
//   validateFeeCharge,
//   validateOPDSchedule,
//   validateOnlineClinic,
//   validateContactInfo,
//   validateAssetMapping,
// };
