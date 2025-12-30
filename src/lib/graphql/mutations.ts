import { gql } from '@apollo/client';

// --- 🔐 AUTHENTICATION ---

// 1. Simple Register (Using Username & Required Phone)
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        username
        email
        phoneNumber
        role
      }
      message
    }
  }
`;

// 2. Standard Login
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        username
        email
        phoneNumber
        role
        isEmailVerified
      }
    }
  }
`;

// 3. Google Login (NextAuth Bridge)
export const GOOGLE_LOGIN_MUTATION = gql`
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken) {
      token
      user {
        id
        username
        email
        role
      }
      message
    }
  }
`;

// 4. OTP Verification
export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOTP($email: String!, $otp: String!) {
    verifyOTP(email: $email, otp: $otp) {
      success
      message
    }
  }
`;

// --- ⚙️ PLATFORM SETTINGS (ADMIN) ---

export const UPDATE_PLATFORM_SETTINGS_MUTATION = gql`
  mutation UpdatePlatformSettings($input: UpdatePlatformSettingsInput!) {
    updatePlatformSettings(input: $input) {
      id
      companyName
      description
      supportEmail
      supportPhone
      address
      facebookUrl
      twitterUrl
      instagramUrl
      linkedinUrl
      currency
      taxPercentage
    }
  }
`;

// --- 🚗 CAR MANAGEMENT (ADMIN) ---

export const CREATE_CAR_MUTATION = gql`
  mutation CreateCar($input: CreateCarInput!) {
    createCar(input: $input) {
      id
      brand { name }
      model { name }
      plateNumber
      status
    }
  }
`;

export const UPDATE_CAR_MUTATION = gql`
  mutation UpdateCar($id: ID!, $input: UpdateCarInput!) {
    updateCar(id: $id, input: $input) {
      id
      status
      dailyKmLimit
      extraKmCharge
      currentMileage
      updatedAt
    }
  }
`;

export const DELETE_CAR_MUTATION = gql`
  mutation DeleteCar($id: ID!) {
    deleteCar(id: $id)
  }
`;

// --- 📸 IMAGE MANAGEMENT (CLOUDINARY) ---

export const ADD_CAR_IMAGE_MUTATION = gql`
  mutation AddCarImage($carId: ID!, $file: Upload!, $isPrimary: Boolean) {
    addCarImage(carId: $carId, file: $file, isPrimary: $isPrimary) {
      id
      imagePath
    }
  }
`;

export const DELETE_CAR_IMAGE_MUTATION = gql`
  mutation DeleteCarImage($imageId: ID!) {
    deleteCarImage(imageId: $imageId)
  }
`;

export const SET_PRIMARY_CAR_IMAGE_MUTATION = gql`
  mutation SetPrimaryCarImage($carId: ID!, $imageId: ID!) {
    setPrimaryCarImage(carId: $carId, imageId: $imageId)
  }
`;

// --- 📅 BOOKING FLOW ---

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      totalPrice
      allowedKm
      depositAmount
      bookingType
      repairOrderId
    }
  }
`;

export const CONFIRM_BOOKING_MUTATION = gql`
  mutation ConfirmBooking($bookingId: ID!) {
    confirmBooking(bookingId: $bookingId) {
      success
      message
      booking {
        id
        status
        startDate
        endDate
        totalPrice
        rentalType
        bookingType
        verification {
          token
          expiresAt
        }
      }
    }
  }
`;

export const RESEND_VERIFICATION_LINK_MUTATION = gql`
  mutation ResendVerificationLink($bookingId: ID!) {
    resendVerificationLink(bookingId: $bookingId) {
      success
      message
      expiresAt
    }
  }
`;

export const CREATE_OR_UPDATE_DRIVER_PROFILE_MUTATION = gql`
  mutation CreateOrUpdateDriverProfile($input: DriverProfileInput!) {
    createOrUpdateDriverProfile(input: $input) {
      id
      licenseNumber
      licenseExpiry
      idNumber
      dateOfBirth
      status
    }
  }
`;

export const SEND_VERIFICATION_LINK_MUTATION = gql`
  mutation SendBookingVerificationLink($bookingId: ID!) {
    sendBookingVerificationLink(bookingId: $bookingId) {
      success
      message
    }
  }
`;

export const VERIFY_BOOKING_TOKEN_MUTATION = gql`
  mutation VerifyBookingToken($token: String!) {
    verifyBookingToken(token: $token) {
      success
      message
      bookingId
    }
  }
`;

export const UPDATE_BOOKING_STATUS_MUTATION = gql`
  mutation UpdateBookingStatus($id: ID!, $status: BookingStatus!) {
    updateBookingStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const CANCEL_BOOKING_MUTATION = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id)
  }
`;

export const PROCESS_DOCUMENT_OCR_MUTATION = gql`
  mutation ProcessDocumentOCR($file: Upload!, $documentType: String, $side: String) {
    processDocumentOCR(file: $file, documentType: $documentType, side: $side) {
      fullName
      documentId
      expiryDate
      birthDate
      address
    }
  }
`;

// --- 📏 METER TRACKING & KM MANAGEMENT ---

export const UPDATE_METER_READINGS_MUTATION = gql`
  mutation UpdateMeterReadings($bookingId: ID!, $input: UpdateMeterReadingInput!) {
    updateMeterReadings(bookingId: $bookingId, input: $input) {
      id
      startMeter
      endMeter
      status
    }
  }
`;

export const FINALIZE_BOOKING_RETURN_MUTATION = gql`
  mutation FinalizeBookingReturn($bookingId: ID!) {
    finalizeBookingReturn(bookingId: $bookingId) {
      id
      endMeter
      extraKmUsed
      extraKmCharge
      totalFinalPrice
      status
    }
  }
`;

// --- 💳 PAYMENT ---

export const CREATE_PAYMENT_MUTATION = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      id
      status
      transactionId
      booking {
        id
        status
      }
    }
  }
`;

// --- 🪪 DRIVER PROFILE (KYC) ---

export const CREATE_DRIVER_PROFILE_MUTATION = gql`
  mutation CreateOrUpdateDriverProfile($input: DriverProfileInput!) {
    createOrUpdateDriverProfile(input: $input) {
      id
      status
      licenseNumber
      verificationNote
    }
  }
`;

export const VERIFY_DRIVER_PROFILE_MUTATION = gql`
  mutation VerifyDriverProfile($userId: ID!, $status: VerificationStatus!, $note: String) {
    verifyDriverProfile(userId: $userId, status: $status, note: $note) {
      id
      userId
      status
      verificationNote
    }
  }
`;

// --- 🏷️ INVENTORY (BRAND & MODEL) ---

export const CREATE_BRAND_MUTATION = gql`
  mutation CreateBrand($name: String!, $logoUrl: String, $logoPublicId: String) {
    createBrand(name: $name, logoUrl: $logoUrl, logoPublicId: $logoPublicId) {
      id
      name
    }
  }
`;

export const UPDATE_BRAND_MUTATION = gql`
  mutation UpdateBrand($id: ID!, $name: String!, $logoUrl: String, $logoPublicId: String) {
    updateBrand(id: $id, name: $name, logoUrl: $logoUrl, logoPublicId: $logoPublicId) {
      id
      name
    }
  }
`;

export const DELETE_BRAND_MUTATION = gql`
  mutation DeleteBrand($id: ID!) {
    deleteBrand(id: $id)
  }
`;

export const CREATE_MODEL_MUTATION = gql`
  mutation CreateModel($name: String!, $brandId: ID!) {
    createModel(name: $name, brandId: $brandId) {
      id
      name
    }
  }
`;

export const UPDATE_MODEL_MUTATION = gql`
  mutation UpdateModel($id: ID!, $name: String!) {
    updateModel(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_MODEL_MUTATION = gql`
  mutation DeleteModel($id: ID!) {
    deleteModel(id: $id)
  }
`;

// --- 👤 USER MANAGEMENT ---

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      username
      phoneNumber
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;