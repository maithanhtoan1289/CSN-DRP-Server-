
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
  export const markIncidentCompleted = async (req, res) => {
    const { id } = req.body;
  
    try {
      // Kiểm tra id có phải là một số nguyên hay không
      if (isNaN(id) || !Number.isInteger(Number(id))) {
        throw new Error('Invalid incident ID');
      }
  
      const result = await incidentService.moveIncidentToHistory(Number(id));
      res.status(200).json({
        status: 200,
        message: result,
      });
    } catch (error) {
      console.error('Error in markIncidentCompleted controller:', error);
      res.status(500).json({
        status: 500,
        message: 'Internal server error: ' + error.message,
      });
    }
  };