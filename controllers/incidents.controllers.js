
import incidentService from "../services/incidentService.js";

export const shareIncident = async (req, res) => {
  const {
    name,
    type,
    description,
    location,
    status,
    hashtags,
  } = req.body;

  try {
    const incident = await incidentService.addIncident(
      req.userId,
      name,
      type,
      description,
      location,
      status,
      hashtags
    );

    res.status(200).json({
      status: 200,
      message: "Successfully added incident",
      data: incident,
    });
  } catch (error) {
    console.error("Error in addIncident controller:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};


export const getAllIncidents = async (req, res) => {
    try {
      const incidents = await incidentService.getAllIncidents();
  
      res.status(200).json({
        status: 200,
        message: "Successfully retrieved all incidents",
        data: incidents,
      });
    } catch (error) {
      console.error("Error when fetching all incidents", error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  };
  

export const updateIncident = async (req, res) => {
    const incidentId = req.params.id;
    const newData = req.body;
  
    try {
      const updatedIncident = await incidentService.updateIncident(incidentId, newData);
  
      res.status(200).json({
        status: 200,
        message: "Successfully updated incident",
        data: updatedIncident,
      });
    } catch (error) {
      console.error("Error when updating incident", error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  };
  //tim kiem bang hashtag
  export const findHashtagIncidents = async (req, res) => {
    const { startLocation, endLocation } = req.body;
  
    try {
      const incidents = await incidentService.findHashtagIncidents(startLocation, endLocation);
  
      res.status(200).json({
        status: 200,
        message: "Successfully retrieved incidents",
        data: incidents,
      });
    } catch (error) {
      console.error("Error in findIncidents controller:", error);
      res.status(500).json({
        status: 500,
        message: "Internal server error: " + error.message,
      });
    }
  };
  // export const markIncidentAsResolved = async (req, res) => {
  //   const { incidentId } = req.body;
  
  //   if (!incidentId) {
  //     return res.status(400).json({
  //       status: 400,
  //       message: 'Incident ID is required',
  //     });
  //   }
  
  //   try {
  //     // Đánh dấu sự cố đã giải quyết trong bảng incidents
  //     await incidentService.updateIncident(incidentId, { status: 1 });
  
  //     // Chuyển sự cố đã giải quyết sang bảng history_incidents
  //     const result = await incidentService.markIncidentAsResolved(incidentId);
  
  //     return res.status(200).json({
  //       status: 200,
  //       message: result,
  //     });
  //   } catch (error) {
  //     console.error('Error in markIncidentAsResolved controller:', error);
  //     return res.status(500).json({
  //       status: 500,
  //       message: 'Internal server error',
  //     });
  //   }
  // };
  