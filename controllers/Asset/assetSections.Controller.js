const Asset = require("../../modals/AssetMaster/AssetMaster");
const { __requestResponse } = require("../../utils/constant");
const {
  __SUCCESS,
  __SOME_ERROR,
  __NO_LOOKUP_LIST,
} = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");

// -------------------------
// Section 3: Incorporation Details
// -------------------------
exports.updateIncorporationDetails = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const {
      RegistrationBody,
      RegistrationCertificate,
      RegistrationYear,
      RegistrationNumber,
      ValidityExpiry,
    } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updateData = {};
    if (RegistrationBody !== undefined) updateData.RegistrationBody = RegistrationBody;
    if (RegistrationCertificate !== undefined) updateData.RegistrationCertificate = RegistrationCertificate;
    if (RegistrationYear !== undefined) updateData.RegistrationYear = RegistrationYear;
    if (RegistrationNumber !== undefined) updateData.RegistrationNumber = RegistrationNumber;
    if (ValidityExpiry !== undefined) updateData.ValidityExpiry = ValidityExpiry;

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Incorporation details updated successfully",
        data: {
          RegistrationBody: updatedAsset.RegistrationBody,
          RegistrationCertificate: updatedAsset.RegistrationCertificate,
          RegistrationYear: updatedAsset.RegistrationYear,
          RegistrationNumber: updatedAsset.RegistrationNumber,
          ValidityExpiry: updatedAsset.ValidityExpiry,
        },
        // updatedAsset,
      })
    );
  } catch (error) {
    console.error("Update Incorporation Details Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getIncorporationDetails = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId).select(
      "RegistrationBody RegistrationCertificate RegistrationYear RegistrationNumber ValidityExpiry"
    );

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Incorporation Details Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 4: Verification Details
// -------------------------
exports.updateVerificationDetails = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const {
      IncorporationCredentialCheck,
      EmploymentCheck,
      EducationalCredentialCheck,
      CriminalRecordCheck,
      PatientTestimonyCheck,
      OnlineReputationCheck,
      VerifiedBy,
      VerificationDate,
      VerificationCertificate,
    } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updateData = {};
    if (IncorporationCredentialCheck !== undefined) updateData.IncorporationCredentialCheck = IncorporationCredentialCheck;
    if (EmploymentCheck !== undefined) updateData.EmploymentCheck = EmploymentCheck;
    if (EducationalCredentialCheck !== undefined) updateData.EducationalCredentialCheck = EducationalCredentialCheck;
    if (CriminalRecordCheck !== undefined) updateData.CriminalRecordCheck = CriminalRecordCheck;
    if (PatientTestimonyCheck !== undefined) updateData.PatientTestimonyCheck = PatientTestimonyCheck;
    if (OnlineReputationCheck !== undefined) updateData.OnlineReputationCheck = OnlineReputationCheck;
    if (VerifiedBy !== undefined) updateData.VerifiedBy = VerifiedBy;
    if (VerificationDate !== undefined) updateData.VerificationDate = VerificationDate;
    if (VerificationCertificate !== undefined) updateData.VerificationCertificate = VerificationCertificate;

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Verification details updated successfully",
        data: {
          IncorporationCredentialCheck: updatedAsset.IncorporationCredentialCheck,
          EmploymentCheck: updatedAsset.EmploymentCheck,
          EducationalCredentialCheck: updatedAsset.EducationalCredentialCheck,
          CriminalRecordCheck: updatedAsset.CriminalRecordCheck,
          PatientTestimonyCheck: updatedAsset.PatientTestimonyCheck,
          OnlineReputationCheck: updatedAsset.OnlineReputationCheck,
          VerifiedBy: updatedAsset.VerifiedBy,
          VerificationDate: updatedAsset.VerificationDate,
          VerificationCertificate: updatedAsset.VerificationCertificate,
        },
      })
    );
  } catch (error) {
    console.error("Update Verification Details Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getVerificationDetails = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId).select(
      "IncorporationCredentialCheck EmploymentCheck EducationalCredentialCheck CriminalRecordCheck PatientTestimonyCheck OnlineReputationCheck VerifiedBy VerificationDate VerificationCertificate"
    );

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Verification Details Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 5: Hospital Size
// -------------------------
exports.updateHospitalSize = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const {
      NumberOfDepartments,
      NumberOfDoctors,
      NumberOfConsultingPhysicians,
      NumberOfNursingStaff,
      NumberOfBeds,
      NumberOfICUBeds,
      NumberOfOTs,
    } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updateData = {};
    if (NumberOfDepartments !== undefined) updateData.NumberOfDepartments = NumberOfDepartments;
    if (NumberOfDoctors !== undefined) updateData.NumberOfDoctors = NumberOfDoctors;
    if (NumberOfConsultingPhysicians !== undefined) updateData.NumberOfConsultingPhysicians = NumberOfConsultingPhysicians;
    if (NumberOfNursingStaff !== undefined) updateData.NumberOfNursingStaff = NumberOfNursingStaff;
    if (NumberOfBeds !== undefined) updateData.NumberOfBeds = NumberOfBeds;
    if (NumberOfICUBeds !== undefined) updateData.NumberOfICUBeds = NumberOfICUBeds;
    if (NumberOfOTs !== undefined) updateData.NumberOfOTs = NumberOfOTs;

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Hospital size details updated successfully",
        data: {
          NumberOfDepartments: updatedAsset.NumberOfDepartments,
          NumberOfDoctors: updatedAsset.NumberOfDoctors,
          NumberOfConsultingPhysicians: updatedAsset.NumberOfConsultingPhysicians,
          NumberOfNursingStaff: updatedAsset.NumberOfNursingStaff,
          NumberOfBeds: updatedAsset.NumberOfBeds,
          NumberOfICUBeds: updatedAsset.NumberOfICUBeds,
          NumberOfOTs: updatedAsset.NumberOfOTs,
        },
      })
    );
  } catch (error) {
    console.error("Update Hospital Size Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getHospitalSize = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId).select(
      "NumberOfDepartments NumberOfDoctors NumberOfConsultingPhysicians NumberOfNursingStaff NumberOfBeds NumberOfICUBeds NumberOfOTs"
    );

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Hospital Size Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 6: Address
// -------------------------
exports.updateAddress = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const {
      AddressLine1,
      AddressLine2,
      PostalCode,
      GeoLocation,
    } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updateData = {};
    if (AddressLine1 !== undefined) updateData.AddressLine1 = AddressLine1;
    if (AddressLine2 !== undefined) updateData.AddressLine2 = AddressLine2;
    if (PostalCode !== undefined) updateData.PostalCode = PostalCode;
    if (GeoLocation !== undefined) updateData.GeoLocation = GeoLocation;

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Address updated successfully",
        data: {
          AddressLine1: updatedAsset.AddressLine1,
          AddressLine2: updatedAsset.AddressLine2,
          PostalCode: updatedAsset.PostalCode,
          GeoLocation: updatedAsset.GeoLocation,
        },
      })
    );
  } catch (error) {
    console.error("Update Address Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getAddress = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId).select(
      "AddressLine1 AddressLine2 PostalCode GeoLocation"
    );

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Address Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 7: Asset Profile
// -------------------------
exports.updateAssetProfile = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const {
      ShortDescription,
      LongDescription,
      ProfilePicture,
      Logo,
      PictureGallery,
      VideoGallery,
      ProfilePDF,
      VideoBio,
      Fellowships,
      NoofSurgeriesPerformed,
      NoofSatisfiedPatients,
      NoofArticlesPublished,
      NoofLecturesDelivered,
    } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updateData = {};
    if (ShortDescription !== undefined)
      updateData.ShortDescription = ShortDescription;
    if (LongDescription !== undefined)
      updateData.LongDescription = LongDescription;
    if (ProfilePicture !== undefined)
      updateData.ProfilePicture = ProfilePicture;
    if (Logo !== undefined) updateData.Logo = Logo;
    if (PictureGallery !== undefined)
      updateData.PictureGallery = PictureGallery;
    if (VideoGallery !== undefined) updateData.VideoGallery = VideoGallery;
    if (ProfilePDF !== undefined) updateData.ProfilePDF = ProfilePDF;
    if (VideoBio !== undefined) updateData.VideoBio = VideoBio;

    if (Fellowships !== undefined) updateData.Fellowships = Fellowships;
    if (NoofSurgeriesPerformed !== undefined)
      updateData.NoofSurgeriesPerformed = NoofSurgeriesPerformed;
    if (NoofSatisfiedPatients !== undefined)
      updateData.NoofSatisfiedPatients = NoofSatisfiedPatients;
    if (NoofArticlesPublished !== undefined)
      updateData.NoofArticlesPublished = NoofArticlesPublished;
    if (NoofLecturesDelivered !== undefined)
      updateData.NoofLecturesDelivered = NoofLecturesDelivered;

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Asset profile updated successfully",
        data: {
          ShortDescription: updatedAsset.ShortDescription,
          LongDescription: updatedAsset.LongDescription,
          ProfilePicture: updatedAsset.ProfilePicture,
          Logo: updatedAsset.Logo,
          PictureGallery: updatedAsset.PictureGallery,
          VideoGallery: updatedAsset.VideoGallery,
          ProfilePDF: updatedAsset.ProfilePDF,
          VideoBio: updatedAsset.VideoBio,
          Fellowships: updatedAsset.Fellowships,
          NoofSurgeriesPerformed: updatedAsset.NoofSurgeriesPerformed,
          NoofSatisfiedPatients: updatedAsset.NoofSatisfiedPatients,
          NoofArticlesPublished: updatedAsset.NoofArticlesPublished,
          NoofLecturesDelivered: updatedAsset.NoofLecturesDelivered,
        },
      })
    );
  } catch (error) {
    console.error("Update Asset Profile Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getAssetProfile = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId).select(
      "ShortDescription LongDescription ProfilePicture Logo PictureGallery VideoGallery ProfilePDF VideoBio"
    );

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Asset Profile Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 8: Medical Specialties
// -------------------------
exports.updateMedicalSpecialties = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const { MedicalSpecialties, Specialization } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $set: { MedicalSpecialties, Specialization } },
      { new: true, runValidators: true }
    ).populate("MedicalSpecialties", "lookup_value");

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Medical specialties updated successfully",
        data: {
          MedicalSpecialties: updatedAsset.MedicalSpecialties,
          Specialization: updatedAsset.Specialization,
        },
      })
    );
  } catch (error) {
    console.error("Update Medical Specialties Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getMedicalSpecialties = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId)
      .select("MedicalSpecialties")
      .populate("MedicalSpecialties", "lookup_value");

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Medical Specialties Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 9: Social Media Assets
// -------------------------
exports.updateSocialMedia = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const {
      Website,
      YouTubeChannel,
      FacebookPage,
      InstagramAccount,
      LinkedInAccount,
      WhatsAppCommunity,
      TelegramChannel,
    } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updateData = {};
    if (Website !== undefined) updateData.Website = Website;
    if (YouTubeChannel !== undefined) updateData.YouTubeChannel = YouTubeChannel;
    if (FacebookPage !== undefined) updateData.FacebookPage = FacebookPage;
    if (InstagramAccount !== undefined) updateData.InstagramAccount = InstagramAccount;
    if (LinkedInAccount !== undefined) updateData.LinkedInAccount = LinkedInAccount;
    if (WhatsAppCommunity !== undefined) updateData.WhatsAppCommunity = WhatsAppCommunity;
    if (TelegramChannel !== undefined) updateData.TelegramChannel = TelegramChannel;

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Social media details updated successfully",
        data: {
          Website: updatedAsset.Website,
          YouTubeChannel: updatedAsset.YouTubeChannel,
          FacebookPage: updatedAsset.FacebookPage,
          InstagramAccount: updatedAsset.InstagramAccount,
          LinkedInAccount: updatedAsset.LinkedInAccount,
          WhatsAppCommunity: updatedAsset.WhatsAppCommunity,
          TelegramChannel: updatedAsset.TelegramChannel,
        },
      })
    );
  } catch (error) {
    console.error("Update Social Media Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getSocialMedia = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId).select(
      "Website YouTubeChannel FacebookPage InstagramAccount LinkedInAccount WhatsAppCommunity TelegramChannel"
    );

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Social Media Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 10: Treatment Packages
// -------------------------
exports.addTreatmentPackage = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const packageData = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      // { $push: { TreatmentPackages: packageData } },
        { $set: { TreatmentPackages: packageData } },
      { new: true, runValidators: true }
    ).populate("TreatmentPackages.PackageCurrency", "lookup_value");

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Treatment package added successfully",
        data: updatedAsset.TreatmentPackages,
      })
    );
  } catch (error) {
    console.error("Add Treatment Package Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.updateTreatmentPackage = async (req, res) => {
  try {
    const { AssetId, PackageId } = req.params;
    const packageData = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const packageIndex = asset.TreatmentPackages.findIndex(
      (pkg) => pkg._id.toString() === PackageId
    );

    if (packageIndex === -1) {
      return res.json(__requestResponse("404", "Treatment package not found"));
    }

    // Update specific package
    Object.keys(packageData).forEach((key) => {
      if (packageData[key] !== undefined) {
        asset.TreatmentPackages[packageIndex][key] = packageData[key];
      }
    });

    await asset.save();

    const updatedAsset = await Asset.findById(AssetId)
      .populate("TreatmentPackages.PackageCurrency", "lookup_value");

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Treatment package updated successfully",
        data: updatedAsset.TreatmentPackages,
      })
    );
  } catch (error) {
    console.error("Update Treatment Package Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.deleteTreatmentPackage = async (req, res) => {
  try {
    const { AssetId, PackageId } = req.params;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $pull: { TreatmentPackages: { _id: PackageId } } },
      { new: true, runValidators: true }
    ).populate("TreatmentPackages.PackageCurrency", "lookup_value");

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Treatment package deleted successfully",
        data: updatedAsset.TreatmentPackages,
      })
    );
  } catch (error) {
    console.error("Delete Treatment Package Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getTreatmentPackages = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId)
      .select("TreatmentPackages")
      .populate("TreatmentPackages.PackageCurrency", "lookup_value");

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Treatment Packages Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 11: Bank Details
// -------------------------
exports.updateBankDetails = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const {
      AccountName,
      AccountNumber,
      BankName,
      SwiftIFSCCode,
      PaymentQRCode,
      OnlinePaymentURL,
    } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updateData = {};
    if (AccountName !== undefined) updateData.AccountName = AccountName;
    if (AccountNumber !== undefined) updateData.AccountNumber = AccountNumber;
    if (BankName !== undefined) updateData.BankName = BankName;
    if (SwiftIFSCCode !== undefined) updateData.SwiftIFSCCode = SwiftIFSCCode;
    if (PaymentQRCode !== undefined) updateData.PaymentQRCode = PaymentQRCode;
    if (OnlinePaymentURL !== undefined) updateData.OnlinePaymentURL = OnlinePaymentURL;

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Bank details updated successfully",
        data: {
          AccountName: updatedAsset.AccountName,
          AccountNumber: updatedAsset.AccountNumber,
          BankName: updatedAsset.BankName,
          SwiftIFSCCode: updatedAsset.SwiftIFSCCode,
          PaymentQRCode: updatedAsset.PaymentQRCode,
          OnlinePaymentURL: updatedAsset.OnlinePaymentURL,
        },
      })
    );
  } catch (error) {
    console.error("Update Bank Details Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getBankDetails = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId).select(
      "AccountName AccountNumber BankName SwiftIFSCCode PaymentQRCode OnlinePaymentURL"
    );

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Bank Details Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 12: Fees & Charges
// -------------------------
exports.addFeeCharge = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const feeData = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      // { $push: { FeesAndCharges: feeData } },
        { $set: { FeesAndCharges: feeData } },
      { new: true, runValidators: true }
    ).populate("FeesAndCharges.ServiceCategory FeesAndCharges.FeeCurrency", "lookup_value");

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Fee charge added successfully",
        data: updatedAsset.FeesAndCharges,
      })
    );
  } catch (error) {
    console.error("Add Fee Charge Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.updateFeeCharge = async (req, res) => {
  try {
    const { AssetId, FeeId } = req.params;
    const feeData = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const feeIndex = asset.FeesAndCharges.findIndex(
      (fee) => fee._id.toString() === FeeId
    );

    if (feeIndex === -1) {
      return res.json(__requestResponse("404", "Fee charge not found"));
    }

    // Update specific fee
    Object.keys(feeData).forEach((key) => {
      if (feeData[key] !== undefined) {
        asset.FeesAndCharges[feeIndex][key] = feeData[key];
      }
    });

    await asset.save();

    const updatedAsset = await Asset.findById(AssetId)
      .populate("FeesAndCharges.ServiceCategory FeesAndCharges.FeeCurrency", "lookup_value");

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Fee charge updated successfully",
        data: updatedAsset.FeesAndCharges,
      })
    );
  } catch (error) {
    console.error("Update Fee Charge Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.deleteFeeCharge = async (req, res) => {
  try {
    const { AssetId, FeeId } = req.params;
 
    

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $pull: { FeesAndCharges: { _id: FeeId } } },
      { new: true, runValidators: true }
    ).populate("FeesAndCharges.ServiceCategory FeesAndCharges.FeeCurrency", "lookup_value");

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Fee charge deleted successfully",
        data: updatedAsset.FeesAndCharges,
      })
    );
  } catch (error) {
    console.error("Delete Fee Charge Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getFeesAndCharges = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId)
      .select("FeesAndCharges")
      .populate("FeesAndCharges.ServiceCategory FeesAndCharges.FeeCurrency", "lookup_value");

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Fees And Charges Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 13: OPD Schedule
// -------------------------
exports.addOPDSchedule = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const scheduleData = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      // { $push: { OPDSchedule: scheduleData } },
        { $set: { OPDSchedule: scheduleData } },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "OPD schedule added successfully",
        data: updatedAsset.OPDSchedule,
      })
    );
  } catch (error) {
    console.error("Add OPD Schedule Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.updateOPDSchedule = async (req, res) => {
  try {
    const { AssetId, ScheduleId } = req.params;
    const scheduleData = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const scheduleIndex = asset.OPDSchedule.findIndex(
      (schedule) => schedule._id.toString() === ScheduleId
    );

    if (scheduleIndex === -1) {
      return res.json(__requestResponse("404", "OPD schedule not found"));
    }

    // Update specific schedule
    Object.keys(scheduleData).forEach((key) => {
      if (scheduleData[key] !== undefined) {
        asset.OPDSchedule[scheduleIndex][key] = scheduleData[key];
      }
    });

    await asset.save();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "OPD schedule updated successfully",
        data: asset.OPDSchedule,
      })
    );
  } catch (error) {
    console.error("Update OPD Schedule Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.deleteOPDSchedule = async (req, res) => {
  try {
    const { AssetId, ScheduleId } = req.params;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $pull: { OPDSchedule: { _id: ScheduleId } } },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "OPD schedule deleted successfully",
        data: updatedAsset.OPDSchedule,
      })
    );
  } catch (error) {
    console.error("Delete OPD Schedule Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getOPDSchedule = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId).select("OPDSchedule");

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get OPD Schedule Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 14: Online Clinic
// -------------------------
exports.updateOnlineClinic = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const { OnlineClinicLink } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $set: { OnlineClinicLink } },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Online clinic link updated successfully",
        data: {
          OnlineClinicLink: updatedAsset.OnlineClinicLink,
        },
      })
    );
  } catch (error) {
    console.error("Update Online Clinic Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getOnlineClinic = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId).select("OnlineClinicLink");

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Online Clinic Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 15: Contact Information
// -------------------------
exports.updateContactInfo = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const {
      ContactName,
      ContactPhoneNumber,
      ContactEmailAddress,
    } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updateData = {};
    if (ContactName !== undefined) updateData.ContactName = ContactName;
    if (ContactPhoneNumber !== undefined) updateData.ContactPhoneNumber = ContactPhoneNumber;
    if (ContactEmailAddress !== undefined) updateData.ContactEmailAddress = ContactEmailAddress;

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Contact information updated successfully",
        data: {
          ContactName: updatedAsset.ContactName,
          ContactPhoneNumber: updatedAsset.ContactPhoneNumber,
          ContactEmailAddress: updatedAsset.ContactEmailAddress,
        },
      })
    );
  } catch (error) {
    console.error("Update Contact Info Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getContactInfo = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId).select(
      "ContactName ContactPhoneNumber ContactEmailAddress"
    );

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Contact Info Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// -------------------------
// Section 17: Asset Mapping
// -------------------------
exports.addAssetMapping = async (req, res) => {
  try {
    const { AssetId } = req.params;
    const { MappedAssetId } = req.body;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    // Check if mapping already exists
    if (asset.AssetMapping.includes(MappedAssetId)) {
      return res.json(__requestResponse("400", "Asset mapping already exists"));
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $push: { AssetMapping: MappedAssetId } },
      { new: true, runValidators: true }
    ).populate("AssetMapping", "AssetName");

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Asset mapping added successfully",
        data: updatedAsset.AssetMapping,
      })
    );
  } catch (error) {
    console.error("Add Asset Mapping Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.removeAssetMapping = async (req, res) => {
  try {
    const { AssetId, MappedAssetId } = req.params;

    const asset = await Asset.findById(AssetId);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      AssetId,
      { $pull: { AssetMapping: MappedAssetId } },
      { new: true, runValidators: true }
    ).populate("AssetMapping", "AssetName");

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Asset mapping removed successfully",
        data: updatedAsset.AssetMapping,
      })
    );
  } catch (error) {
    console.error("Remove Asset Mapping Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getAssetMapping = async (req, res) => {
  try {
    const { AssetId } = req.params;

    const asset = await Asset.findById(AssetId)
      .select("AssetMapping")
      .populate("AssetMapping", "AssetName");

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Asset Mapping Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};