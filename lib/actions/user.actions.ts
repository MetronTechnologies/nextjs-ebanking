'use server';


import {createBankAccountProps, exchangePublicTokenProps, signInProps, SignUpParams, User} from "@/types";
import {createAdminClient, createSessionClient} from "@/lib/appwrite";
import {ID} from "node-appwrite";
import {cookies} from "next/headers";
import {encryptId, extractCustomerIdFromUrl, parseStringify} from "@/lib/utils";
import {CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products} from "plaid";
import {plaidClient} from "@/lib/plaid";
import {revalidatePath} from "next/cache";
import {addFundingSource, createDwollaCustomer} from "@/lib/actions/dwolla.actions";


const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
    PLAID_CLIENT_ID,
    PLAID_SECRET
} = process.env

export const signIn = async ({email, password}: signInProps) => {
    try{
        const {account} = await createAdminClient();
        const response = await account.createEmailPasswordSession(email, password);
        return parseStringify(response);
    } catch (e){
        console.error('Error signing in ', e)
    }
}

export const signUp = async ({password, ...userData}: SignUpParams) => {
    const {email, firstName, lastName} = userData;
    let newUserAccount;
    try{
        const {account, database} = await createAdminClient();
        newUserAccount = await account.create(
            ID.unique(),
            email,
            password,
            `${firstName} ${lastName}`
        );
        if(!newUserAccount){
            throw new Error('Error creating user');
        }
        const dwollaCustomerUrl = await createDwollaCustomer({
            ...userData,
            type: 'personal'
        });
        if(!dwollaCustomerUrl){
            throw new Error('Error creating dwolla customer');
        }
        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
        console.log("")
        const newUser = await database.createDocument(
                DATABASE_ID!,
                USER_COLLECTION_ID!,
                ID.unique(),
                {
                    ...userData,
                    userId: newUserAccount.$id,
                    dwollaCustomerId,
                    dwollaCustomerUrl
                }
            );
        const session = await account.createEmailPasswordSession(email, password);
        cookies().set('appwrite-session', session.secret, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true
        });
        return parseStringify(newUser);
    } catch (e){
        console.error('Error signing up ', e)
    }
}

export const getLoggedInUser = async() => {
    try{
        const {account} = await createSessionClient();
        const user = await account.get();
        return parseStringify(user);
    } catch (e) {
        console.error('Error getting loggedIn user ', e);
        return null;
    }
}

export const logOutAccount = async() => {
  try{
      const {account} =  await createSessionClient();
      cookies().delete('appwrite-session');
      await account.deleteSession('current');
  } catch (e) {
      return null
  }
}


export const createLinkToken = async (user: User) => {
    try{
        const tokenParams = {
            user: {
                client_user_id: user.$id
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
            client_id: PLAID_CLIENT_ID,
            secret: PLAID_SECRET
        }
        const response = await plaidClient.linkTokenCreate(tokenParams);
        return parseStringify({ linkToken: response.data.link_token })
    } catch (e){
        console.error("Error in creating link token ", e);
    }
}


export const createBankAccount = async ({userId, bankId, accountId, accessToken, fundingSourceUrl, shareableId}: createBankAccountProps) => {
    try{
        const {database} = await createAdminClient();
        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                shareableId,
            }
        )
        return parseStringify(bankAccount);
    } catch (e) {
        console.error("Error in creating bank account ", e);
    }
}

export const exchangePublicToken = async ({public_token, user}: exchangePublicTokenProps) => {
    try{
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: public_token
        });
        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;
        const accountResponse = await plaidClient.accountsGet({
            access_token: accessToken
        });
        const accountData = accountResponse.data.account[0];
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: 'dwolla' as ProcessorTokenCreateRequestProcessorEnum
        };
        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name
        });
        if(!fundingSourceUrl) throw Error;
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            shareableId: encryptId(accountData.account_id)
        });
        revalidatePath('/');
        return parseStringify({
            publicTokenExchange: 'complete'
        });
    } catch (e){
        console.error("Error in exchanging public token ", e);
    }
}










