
export const RouteList = {
    usersList: "/users/list", //Searches user based on name LIKE%
    listTravelPlans: "/travel", //List all travel plans
    listMyTravelPlans: "/travel/user/", //List my travel plans
    travelingUsers: '/travel/traveling-user', //List All traveling user {travelId}
    uploadTravelingDocs: '/travel/documents', //{uploadedBy}/{travelingUser}/{docType}
    uploadedTravelingDocs: '/travel/documents' //{travelingUserId}
}