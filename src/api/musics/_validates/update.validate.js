import Joi from 'joi';

export default (req, res, next) => {

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    Joi
        .object(
            {
                name     : Joi.string(),
                duration : Joi.number(),
                albumName: Joi.string(),
                _artistId: Joi.string().regex(objectIdRegex)
            }
        )
        .validate(req.body, err => {

            if (err) {
                return res.api.send(err.details, res.api.codes.UNPROCESSABLE_ENTITY);
            }

            next();
        });
}