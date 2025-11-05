const axios = require('axios');

exports.validateEmployee = async (req, res) => {
  try {
    const { carnet } = req.body;

    if (!carnet) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El carnet es obligatorio' 
      });
    }

    const response = await axios.post(
      'https://appgamc.cochabamba.bo/transparencia/servicio/busqueda_empleados.php',
      new URLSearchParams({
        tipo: 'D',
        dato: carnet
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (response.data && response.data.status === true && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      const empleado = response.data.data[0];
      return res.status(200).json({
        status: 'success',
        data: {
          found: true,
          name: empleado.empleado,
          carnet: carnet
        }
      });
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'El carnet de identidad no está registrado en el sistema de RRHH',
        data: { found: false }
      });
    }
  } catch (error) {
    console.error('Error al validar empleado:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al comunicarse con el sistema de RRHH'
    });
  }
};