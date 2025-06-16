import { Router } from "express";
import { createOrganization, deleteOrganization, updateOrganization } from "../controller/org.controller";

const router = Router()

router.route('/create-org').post(createOrganization);

router.route('/update-org').post(updateOrganization);

router.route('delete-org').post(deleteOrganization);

router.route('/')