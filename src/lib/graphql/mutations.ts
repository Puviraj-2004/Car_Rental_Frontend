import { gql } from '@apollo/client';

// --- 🔐 AUTHENTICATION ---

// 1. Simple Register (Using Username & Required Phone)
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      message
      email
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
        fullName
        email
        phoneNumber
        role
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
        fullName
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

// 5. OTP Resend
export const RESEND_OTP_MUTATION = gql`
  mutation ResendOTP($email: String!) {
    resendOTP(email: $email) {
      success
      message
      expiresAt
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
      brand { name }
      model { name }
      status
      dailyKmLimit
      extraKmCharge
      currentOdometer
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
      url
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
      depositAmount
      bookingType
      repairOrderId
    }
  }
`;

export const CONFIRM_RESERVATION_MUTATION = gql`
  mutation ConfirmReservation($id: ID!) {
    confirmReservation(id: $id) {
      id
      status
      verification {
        id
        token
        expiresAt
        isVerified
      }
      startDate
      endDate
      totalPrice
      car {
        brand { name }
        model { name }
        plateNumber
      }
      user {
        fullName
        email
      }
    }
  }
`;

export const CONFIRM_BOOKING_MUTATION = gql`
  mutation ConfirmBooking($bookingId: String!) {
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
  mutation ResendVerificationLink($bookingId: String!) {
    resendVerificationLink(bookingId: $bookingId) {
      success
      message
      expiresAt
    }
  }
`;

export const CREATE_OR_UPDATE_VERIFICATION_MUTATION = gql`
  mutation CreateOrUpdateVerification($input: DocumentVerificationInput!) {
    createOrUpdateVerification(input: $input) {
      bookingId
      booking{
        id 
        user{
          id 
          fullName
        }
      }
      licenseFrontUrl
      licenseBackUrl
      idCardUrl
      idCardBackUrl
      addressProofUrl
      licenseNumber
      licenseExpiry
      licenseIssueDate
      driverDob
      licenseCategories
      idNumber
      idExpiry
      verifiedAddress
      status
    }
  }
`;

export const CREATE_STRIPE_CHECKOUT_SESSION_MUTATION = gql`
  mutation CreateStripeCheckoutSession($bookingId: String!) {
    createStripeCheckoutSession(bookingId: $bookingId) {
      url
      sessionId
    }
  }
`;

export const MOCK_FINALIZE_PAYMENT_MUTATION = gql`
  mutation MockFinalizePayment($bookingId: String!, $success: Boolean!) {
    mockFinalizePayment(bookingId: $bookingId, success: $success) {
      id
      status
      amount
      booking {
        id
        status
      }
    }
  }
`;

export const SEND_VERIFICATION_LINK_MUTATION = gql`
  mutation SendBookingVerificationLink($bookingId: String!) {
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

export const UPDATE_BOOKING_MUTATION = gql`
  mutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {
    updateBooking(id: $id, input: $input) {
      id
      startDate
      endDate
      pickupTime
      returnTime
      status
      basePrice
      taxAmount
      totalPrice
      car {
        id
        brand { name }
        model { name }
        plateNumber
        fuelType
        transmission
        requiredLicense
        dailyKmLimit
        extraKmCharge
        pricePerDay
        depositAmount
        images {
          url
          isPrimary
        }
      }
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
  mutation ProcessDocumentOCR($file: Upload!, $documentType: DocumentType, $side: DocumentSide) {
    processDocumentOCR(file: $file, documentType: $documentType, side: $side) {
      firstName
      lastName
      fullName
      documentId
      licenseNumber
      expiryDate
      issueDate
      birthDate
      address
      licenseCategories
      restrictsToAutomatic
      isQuotaExceeded
      fallbackUsed
    }
  }
`;

// --- 📏 METER TRACKING & KM MANAGEMENT ---

export const UPDATE_METER_READINGS_MUTATION = gql`
  mutation UpdateMeterReadings($bookingId: String!, $input: UpdateMeterReadingInput!) {
    updateMeterReadings(bookingId: $bookingId, input: $input) {
      id
      startMeter
      endMeter
      status
    }
  }
`;

export const FINALIZE_BOOKING_RETURN_MUTATION = gql`
  mutation FinalizeBookingReturn($bookingId: String!) {
    finalizeBookingReturn(bookingId: $bookingId) {
      id
      endMeter
      extraKmFee
      totalFinalPrice
      status
    }
  }
`;

// --- PAYMENT ---

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

// --- INVENTORY (BRAND & MODEL) ---

export const CREATE_BRAND_MUTATION = gql`
  mutation CreateBrand($name: String!, $logoUrl: String) {
    createBrand(name: $name, logoUrl: $logoUrl) {
      id
      name
      logoUrl
    }
  }
`;

export const UPDATE_BRAND_MUTATION = gql`
  mutation UpdateBrand($id: ID!, $name: String!, $logoUrl: String) {
    updateBrand(id: $id, name: $name, logoUrl: $logoUrl) {
      id
      name
      logoUrl
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
      fullName
      phoneNumber
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const START_TRIP_MUTATION = gql`
  mutation StartTrip($bookingId: String!, $startOdometer: Float, $pickupNotes: String) {
    startTrip(bookingId: $bookingId, startOdometer: $startOdometer, pickupNotes: $pickupNotes) {
      id
      status
      startOdometer
      pickupNotes
      car {
        id
        status
      }
    }
  }
`;

export const COMPLETE_TRIP_MUTATION = gql`
  mutation CompleteTrip($bookingId: String!) {
    completeTrip(bookingId: $bookingId) {
      id
      status
      car {
        id
        status
      }
    }
  }
`;

export const FINISH_CAR_MAINTENANCE_MUTATION = gql`
  mutation FinishCarMaintenance($carId: ID!) {
    finishCarMaintenance(carId: $carId) {
      id
      status
    }
  }
`;

export const VERIFY_DRIVER_PROFILE_MUTATION = gql`
  mutation VerifyDocument($userId: ID!, $status: VerificationStatus!, $reason: String) {
    verifyDocument(userId: $userId, status: $status, reason: $reason) {
      id
      status
    }
  }
`;




