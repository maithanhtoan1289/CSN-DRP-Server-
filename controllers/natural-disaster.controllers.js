import naturalDisasterService from "../services/naturalDisasterService.js";
import userService from "../services/userService.js";

export const getAllNaturalDisastersByPageAndLimit = async (req, res) => {
  const { page, limit } = req.query;

  try {
    const naturalDisastersQuery =
      await naturalDisasterService.getAllNaturalDisastersByPageAndLimit(
        page,
        limit
      );

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved all natural disasters",
      data: naturalDisastersQuery,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};

export const addNaturalDisasterVersion1 = async (req, res) => {
  const {
    effected_area,
    coordinates,
    name,
    naturalDisasterName,
    naturalDisasterType,
    phone,
    username,
    email,
    role,
    password,
    urlImage,
    priority,

  } = req.body;

  try {
    const start_date = new Date();
    const end_date = null;
    const address = effected_area;
    const status = "chưa kết thúc";
    const avatar = `https://avatar.iran.liara.run/username?username=${name}`;

    const roleId = await userService.createRole(role);

    const userId = await userService.createUser(
      name,
      username,
      email,
      password,
      roleId,
      phone,
      coordinates,
      address,
      avatar
    );

    const naturalDisastersQuery =
      await naturalDisasterService.addNaturalDisaster(
        userId,
        naturalDisasterName,
        naturalDisasterType,
        start_date,
        end_date,
        effected_area,
        status,
        urlImage,
        priority,

      );

    res.status(200).json({
      status: 200,
      message: "Successfully add natural disaster",
      data: {
        id: userId,
        name,
        username,
        email,
        avatar,
        role,
        naturalDisastersQuery,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};

export const addNaturalDisasterVersion2 = async (req, res) => {
  const {
    effected_area,
    coordinates,
    name,
    naturalDisasterName,
    naturalDisasterType,
    phone,
    id,
    urlImage,
    // Task bổ sung
    priority,
  } = req.body;

  try {
    const start_date = new Date();
    const end_date = null;
    const address = effected_area;
    const status = "chưa kết thúc";

    const userId = id;

    await userService.addCoordinates(userId, address, coordinates, phone);

    const naturalDisaster = await naturalDisasterService.addNaturalDisaster(
      userId,
      naturalDisasterName,
      naturalDisasterType,
      start_date,
      end_date,
      effected_area,
      status,
      urlImage,
      // Task bổ sung
      priority,
    );

    res.status(200).json({
      status: 200,
      message: "Successfully add natural disaster",
      data: {
        id: userId,
        name,
        naturalDisaster,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};

// Task 5
export const addNaturalDisasterVersion3 = async (req, res) => {
  const {
    effected_area,
    coordinates,
    name,
    naturalDisasterName,
    naturalDisasterType,
    phone,
    userId,
    urlImage,
    priority,
    roleName,
  } = req.body;

  try {
    const start_date = new Date();
    const end_date = null;
    const address = effected_area;
    const status = "chưa kết thúc";

    await userService.createNewRoleForRescuer(userId, roleName);

    await userService.addCoordinates(userId, address, coordinates, phone);

    const naturalDisaster = await naturalDisasterService.addNaturalDisaster(
      userId,
      naturalDisasterName,
      naturalDisasterType,
      start_date,
      end_date,
      effected_area,
      status,
      urlImage,
      priority
    );

    res.status(200).json({
      status: 200,
      message: "Successfully add natural disaster",
      data: {
        id: userId,
        name,
        naturalDisaster,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};

export const addNaturalDisasterStatus = async (req, res) => {
  const { id, rescueId, typeId, typeName, status } = req.body;

  try {
    const userId = id;
    const naturalDisasterId = typeId;
    const naturalDisasterName = typeName;

    const naturalDisasterUpdated =
      await naturalDisasterService.addNaturalDisasterStatus(
        userId,
        rescueId,
        naturalDisasterId,
        naturalDisasterName,
        status
      );

    res.status(200).json({
      status: 200,
      message: "Successfully add natural disaster status",
      data: {
        naturalDisasterUpdated,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};

// Task 1
export const editNaturalDisasterPriority = async (req, res) => {
  const { naturalDisasterId, priority } = req.body;

  try {
    const naturalDisasterUpdated =
      await naturalDisasterService.editNaturalDisasterPriority(
        naturalDisasterId,
        priority
      );

    res.status(200).json({
      status: 200,
      message: "Successfully edit natural disaster priority",
      data: {
        naturalDisasterUpdated,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};