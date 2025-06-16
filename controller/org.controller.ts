import { inviteUserMailTemplate } from '../mailTemplates/emailTemplates';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';
import prisma from '../utils/prismaClient';
import { sendEmail } from '../utils/sendMail';

const createOrganization = asyncHandler(async (req: any, res: any) => {
  const { orgName, orgLegalName, orgAddress, orgType } = req.body;

  if (
    [orgName, orgLegalName, orgAddress, orgType].some(
      (fields) => fields.trim() === ''
    )
  ) {
    throw ApiError.badRequest('All fields are mandatory!');
  }

  const organization = await prisma.organization.create({
    data: {
      orgAddress: orgAddress,
      orgLegalName: orgLegalName,
      name: orgName,
      orgType: orgType,
    },
  });

  if (!organization) {
    throw ApiError.internalServerError('Error in creating organization');
  }

  res
    .status(201)
    .json(
      ApiResponse.success('Organization created successfully!!!'),
      organization
    );
});

const updateOrganization = asyncHandler(async (req: any, res: any) => {
  const { orgName, orgAddress, orgLegalName, paymentMethod, orgType } =
    req.body;

  if (!orgName && !orgAddress && !orgLegalName && !paymentMethod && !orgType) {
    throw ApiError.badRequest('Please provide at least one field to update.');
  }

  const dataToUpdate: any = {};
  if (orgName) dataToUpdate.name = orgName;
  if (orgAddress) dataToUpdate.orgAddress = orgAddress;
  if (orgLegalName) dataToUpdate.orgLegalName = orgLegalName;
  if (paymentMethod) dataToUpdate.paymentMethod = paymentMethod;
  if (orgType) dataToUpdate.orgType = orgType;

  const updatedDataForOrganization = await prisma.organization.update({
    where: { id: req.params.id },
    data: dataToUpdate,
  });

  if (!updatedDataForOrganization) {
    throw ApiError.internalServerError('Error updating the organization data.');
  }

  return res
    .status(200)
    .json(
      ApiResponse.success(
        updatedDataForOrganization,
        'Data updated successfully!'
      )
    );
});

const deleteOrganization = asyncHandler(async (req: any, res: any) => {
  const { id } = req.body;

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        include: { user: true },
      },
    },
  });

  if (!organization) {
    throw ApiError.notFound('Organization not found.');
  }

  const userIds = organization.users.map((ou: any) => ou.userId);

  await prisma.organizationUser.deleteMany({
    where: {
      organizationId: id,
    },
  });

  for (const userId of userIds) {
    const orgCount = await prisma.organizationUser.count({
      where: { userId },
    });

    if (orgCount === 0) {
      await prisma.user.delete({
        where: { id: userId },
      });
    }
  }

  await prisma.organization.delete({
    where: { id },
  });

  res
    .status(200)
    .json(
      ApiResponse.success('Organization and orphan users deleted successfully.')
    );
});

const inviteUser = asyncHandler(async (req: any, res: any) => {
  const { email, role, firstName } = req.body;
  const {organizationName} = req.params;

  if ([role, email, firstName].some((field) => !field || field.trim() === '')) {
    throw ApiError.badRequest('All fields are mandatory');
  }

  const inviteToken = crypto.randomUUID();
  const inviteLink = `${process.env.FRONTEND_URL || process.env.NGROK_TEST}/invite?token=${inviteToken}`;

  const { subject, html } = inviteUserMailTemplate.generate(firstName, inviteLink, organizationName)

  await sendEmail({
    from: process.env.SENDER_EMAIL || 'abhinav@shipfast.studio',
    to: email,
    subject: subject,
    html: html,
  });

  // Respond with success
  res.status(200).json({
    message: `Invitation sent to ${email}`,
    inviteLink,
  });
});

const addInvitedUser = 

export { createOrganization, updateOrganization, deleteOrganization, inviteUser };
