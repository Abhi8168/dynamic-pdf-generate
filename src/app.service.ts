import { BadRequestException, Injectable } from '@nestjs/common';
import constants from 'lib/common/constants'; // Your constants file with PDF_TEMPLATE_PATH
import * as fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createPath, generatePDFBuffer } from 'lib/common/utility.function';
import * as handlebars from 'handlebars';

@Injectable()
export class AppService {
  async fetchPdfTemplateAndEdit(): Promise<Buffer> {
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(constants.PDF_TEMPLATE_PATH);

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Get the pages
    const pages = pdfDoc.getPages();
    console.log(`Total pages: ${pages.length}`);

    // Get the first page
    const firstPage = pages[0];

    // Example: Metadata about first page (size)
    const { width, height } = firstPage.getSize();
    console.log(`First page size: width=${width}, height=${height}`);

    // Embed font for modification
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Example modification: Add a text overlay on the first page
    firstPage.drawText('Modified: Added this text on page 1', {
      x: 50,
      y: height - 100, // Position near top but inside page
      size: 15,
      font: helveticaFont,
      color: rgb(1, 0, 0), // Red text
    });

    // Save modified PDF to bytes
    const modifiedPdfBytes = await pdfDoc.save();

    // Return as Buffer
    return Buffer.from(modifiedPdfBytes);
  }

  async createPdf(payload) {
    const pdfTemplate = fs.readFileSync(constants.PDF_TEMPLATE_PATH).toString();

    // Ensure the directory exists
    const uploadedPdfDirectory = constants.UPLOADED_PDF_DIRECTORY;
    await createPath(uploadedPdfDirectory);

    const template = await handlebars.compile(pdfTemplate);

    const htmlContent = await template({
      ...payload,
      firstLogoUrl: 'http://localhost:3000/images/logo1.png',
      secondLogoUrl: 'http://localhost:3000/images/logo2.png',
    });
    const customPayload = {
      locationTableImage: '',
      firstLogoUrl: 'http://localhost:3000/images/logo1.png',
      secondLogoUrl: 'http://localhost:3000/images/logo2.png',
      locationTable: {
        bag_pand_id: '0363100012177209',
        hb_nr: 'HB0068',
        straat_huisnrs: 'Singel 367',
        postcode_plaats: '1012 WJ Amsterdam',
        ap_gebied: 'ASD-HDF',
        dp: 'ASD-HDF-ODP008',
        projectnr: '14246',
        aannemer: '',
        datum: '07-07-2025',
        naam_schouwer: 'Bayram Sarikaya',
      },

      decisionTree: {
        flowchartUrl: 'https://via.placeholder.com/600x500',
        notesText: 'Kabels worden naar boven gebracht vanaf begane grond.',
      },
      complexImageUrl: 'https://via.placeholder.com/400x300',
      locationFtuImageUrl: 'https://via.placeholder.com/350x400',
      schematicDrawingImageUrl: 'https://via.placeholder.com/350x400',
      jobDescription: {
        rows: [
          {
            adres: 'Singel',
            hnr: '387-2',
            lengte: '15',
            invoer: '1',
            stp: '1',
            dp: '008',
            streng_id: '008-1-3',
          },
          {
            adres: 'Singel',
            hnr: '387-1',
            lengte: '12',
            invoer: '1',
            stp: '1',
            dp: '008',
            streng_id: '008-1-2',
          },
          {
            adres: 'Singel',
            hnr: '387-H',
            lengte: '5',
            invoer: '1',
            stp: '1',
            dp: '008',
            streng_id: '008-1-1',
          },
        ],
      },
      site_survey: {
        datum_site_survey: '07-07-2025',
        glasvezelvoorbereider: 'B. Sarkaya',
        telefoon: '06-38161722',
        type_pand: {
          app_complex: true,
          duplex: true,
          comm_ruimte_aanwezig: true,
          anders: true,
        },
        monumentaal_pand_janes: 'hhh',
        type_woningen: 'Hoog',
        aantal_woningen: 3,
        aantal_per_etage: {
          B_G: 1,
          first: 1,
          second: 1,
          third: 3,
          fourth: 4,
          fifth: 5,
          sixth: 6,
          seventh: 7,
          eighth: 8,
          ninth: 9,
          tenth: 10,
          eleventh: 11,
          twelfth: 12,
        },
        kiogt_de_bag_met_de_realiteit: false,
        geschatte_hoogte_van_de_site: '3 m',
        stijgpunt: 'Binnendoor',
        hoogwerker_nodig: false,
        site_id: 'Singel 367',
        adressen_die_behoren_tot_de_site: 'Singel 367',
        meerdere_vve_beheerders: false,
        beheer_contact: {
          email: 'godhoudtvanonsallen@hotmail.com',
          telefoon: '0624264538',
        },
        contactpersoon_beheer: '',
        contactpersoon_site: '',
        toegang_site_via: 'hiiii',
        aanwezigen_tijdens_survey: {
          naam: 'GLASVEZELNET AMSTERDAM',
          telefoonnummer: '',
        },
        installatiegegevens: {
          locatie_in_of_opvoerpunt: 'Voorzijde',
          aantal_invoergaten: 1,
          mantelbuis_of_koof_toegankelijk: false,
          bestaande_doorvoer_gebruiken: false,
          locatie_glasvezelaansluitpunt: 'Meterkast',
          locatie_cai_aop: 'Meterkast',
          locatie_isra: 'Meterkast',
          locatie_meterkast: 'Binnen woning',
          afwijkende_huisnummers: false,
          '230v_aanwezig_locatie_ftu': true,
          brandwerende_afdichting: false,
          interne_verdeler_idp_gebruiken: false,
          doorvoerafhankelijk: true,
          ruimte_in_huidige_kabelgoot: false,
        },
      },
      locatieImages: [
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
      ],
      beslisboomImages: [
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
      ],
      aanzichtComplexImages: [
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
      ],
      beschrijvingInvoerpuntenImages: [
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
      ],
      locatieFTUImages: [
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
      ],
      schematischeTekeningImages: [
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
        {
          url: 'https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU',
          alt: 'Aerial Map View',
        },
      ],
    };

    console.log('HTML Content:', htmlContent);
    console.log('Uploaded PDF Directory:', payload);
    const pdfBufferData = await generatePDFBuffer(htmlContent);
    console.log('PDF Buffer Data:', pdfBufferData);
    if (!pdfBufferData) {
      throw new BadRequestException({
        success: false,
        message: 'Something went wrong',
      });
    }
    // Generate a file name (timestamp, UUID, etc.)
    const fileName = `generated-${Date.now()}.pdf`;

    const pdfFilePath = `${uploadedPdfDirectory}/${fileName}`;

    // Create a new PDF document
    fs.writeFileSync(pdfFilePath, pdfBufferData);
    return { pdfFilePath, fileName };
  }
}
